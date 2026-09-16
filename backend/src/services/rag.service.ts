import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChromaClient } from 'chromadb';
import { normalizeText } from '../data/static_faqs';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

// In-Memory fallback vector cache when ChromaDB server is offline
let localVectorStore: DocumentChunk[] = [];
let chromaCollection: any = null;
let isInitialized = false;

/**
 * Carga la documentación base de conocimiento (knowledge_base.txt),
 * realiza la fragmentación (Chunky Overlapping con LangChain) e inicializa ChromaDB.
 */
export async function initializeRagEngine(): Promise<void> {
  if (isInitialized) return;

  try {
    const filePath = path.join(__dirname, '../data/knowledge_base.txt');
    if (!fs.existsSync(filePath)) {
      console.warn('[RAG] El archivo knowledge_base.txt no se encontró.');
      return;
    }

    const textContent = fs.readFileSync(filePath, 'utf-8');

    // Fragmentación Chunky Overlapping usando LangChain RecursiveCharacterTextSplitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 450,
      chunkOverlap: 90,
      separators: ['\n\n', '\n', '=', ' ', ''],
    });

    const docs = await splitter.createDocuments([textContent]);
    localVectorStore = docs.map((doc, idx) => ({
      id: `chunk_${idx}`,
      content: doc.pageContent.trim(),
      metadata: { source: 'knowledge_base.txt', chunkIndex: idx },
    }));

    console.log(`[RAG] Documentación fragmentada exitosamente en ${localVectorStore.length} bloques (chunky overlapping).`);

    // Intentar conectar con la base de datos vectorial ChromaDB si está en ejecución (http://localhost:8000)
    try {
      const chromaUrl = process.env.CHROMA_URL || 'http://127.0.0.1:8000';
      const checkRes = await fetch(`${chromaUrl}/api/v1/heartbeat`, { signal: AbortSignal.timeout(1000) });
      if (checkRes.ok) {
        const client = new ChromaClient({ path: chromaUrl });
        chromaCollection = await client.getOrCreateCollection({ name: 'afc_knowledge_base' });

        // Cargar fragmentos en la colección ChromaDB
        const ids = localVectorStore.map((c) => c.id);
        const documents = localVectorStore.map((c) => c.content);
        const metadatas = localVectorStore.map((c) => c.metadata || {});

        await chromaCollection.upsert({
          ids,
          documents,
          metadatas,
        });

        console.log('[RAG/ChromaDB] Colección afc_knowledge_base sincronizada en ChromaDB.');
      } else {
        throw new Error('ChromaDB heartbeat failed');
      }
    } catch (chromaErr) {
      console.log('[RAG/ChromaDB] ChromaDB no está corriendo localmente en el puerto 8000. Utilizando motor de búsqueda vectorial interno en memoria.');
    }

    isInitialized = true;
  } catch (error) {
    console.error('[RAG Error] Error inicializando el motor RAG:', error);
  }
}

/**
 * Realiza una búsqueda de similitud relevante sobre los fragmentos de la documentación.
 */
export async function searchContext(query: string, limit = 3): Promise<string> {
  if (!isInitialized) {
    await initializeRagEngine();
  }

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return '';

  // 1. Si ChromaDB está conectado, consultar la colección de ChromaDB
  if (chromaCollection) {
    try {
      const results = await chromaCollection.query({
        queryTexts: [query],
        nResults: limit,
      });

      if (results?.documents?.[0]?.length > 0) {
        return results.documents[0].join('\n---\n');
      }
    } catch (err) {
      console.warn('[RAG/ChromaDB Query Error] Fallback a motor local:', err);
    }
  }

  // 2. Fallback: Búsqueda por coincidencia de términos de palabras clave sobre los chunks fragmentados
  const queryWords = normalizedQuery.split(' ').filter((w) => w.length > 2);

  const scoredChunks = localVectorStore.map((chunk) => {
    const normalizedChunk = normalizeText(chunk.content);
    let score = 0;

    for (const word of queryWords) {
      if (normalizedChunk.includes(word)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  const relevant = scoredChunks.filter((s) => s.score > 0).slice(0, limit);
  if (relevant.length === 0) {
    // Si no hay coincidencias directas, devolver los 2 primeros bloques explicativos
    return localVectorStore.slice(0, 2).map((c) => c.content).join('\n---\n');
  }

  return relevant.map((s) => s.chunk.content).join('\n---\n');
}


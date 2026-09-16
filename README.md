<div align="center">

# 🛋️ AFC Furniture — Muebles Premium & Asistente IA

**Plataforma de comercio electrónico de grado de producción construida como Monorepo TypeScript.**

Un e-commerce moderno desarrollado con **Next.js 14 (App Router)** en el frontend y **Express REST API** en el backend, conectado a la base de datos PostgreSQL de **Supabase (con RLS activo)** y potenciado por la IA de **Groq (Llama 3.3 70B)**.

[Características](#-características-principales) · [Tecnologías](#-stack-tecnológico) · [Arquitectura](#-arquitectura-del-sistema) · [Seguridad Anti-DoS](#-seguridad-y-protección-anti-dos) · [Comparador RAG](#-comparador-lado-a-lado-50--50) · [Evaluación Sanity.io](#-evaluación-de-sanityio)

</div>

---

## 📋 Índice

1. [Descripción General](#-descripción-general)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Seguridad y Protección Anti-DoS](#-seguridad-y-protección-anti-dos)
6. [Comparador Lado a Lado (50% / 50%)](#-comparador-lado-a-lado-50--50)
7. [Asistente Inteligente IA (Groq + RAG)](#-asistente-inteligente-ia-groq--rag)
8. [Evaluación de Sanity.io](#-evaluación-de-sanityio)
9. [Rendimiento: Local vs Producción](#-rendimiento-entorno-local-vs-producción)
10. [Guía de Inicio Rápido](#-guía-de-inicio-rápido)
11. [Base de Datos Supabase & RLS](#-base-de-datos-supabase--rls)
12. [Licencia](#-licencia)

---

## 🌟 Descripción General

**AFC Furniture** es un sistema integral de e-commerce enfocado en muebles de lujo y diseño de interiores, localizado principalmente para **Barranquilla, Colombia** (`Calle 76 # 54-11, Alto Prado`) con precios en pesos colombianos (**$ COP**).

El proyecto está diseñado con estándares de arquitectura limpia:
- **Seguridad primero**: Row Level Security (RLS) activo en Supabase, protección contra desbordamiento de búfer DoS, cookies HTTP-Only y tokens JWT rotativos (`SameSite=Lax`).
- **Persistencia Resiliente**: Conexión activa a Supabase PostgreSQL con fallback automático a almacenamiento local para garantizar 0 errores 500.
- **Inteligencia Artificial RAG**: Chatbot impulsado por la API de Groq (`llama-3.3-70b-versatile`) con motor RAG de fragmentación *Chunky Overlapping* (LangChain + ChromaDB) y respuesta en < 5ms para saludos/preguntas estáticas.
- **Diseño Responsivo & Modo Oscuro**: UI moderna con soporte completo para tema claro y oscuro, con contraste optimizado en botones e insignias.

---

## 🎯 Características Principales

| Módulo | Detalles y Funcionalidades |
| :--- | :--- |
| 🛍️ **Catálogo y Búsqueda** | Búsqueda precisa por nombre/SKU, filtros por categoría, rango de precios en COP, material y color. Sanitización de patrones regex. |
| 🔍 **Comparador 50% / 50%** | Comparación de productos en pantalla dividida mitad y mitad con generación instantánea (**< 20ms**) de **Análisis Comparativo RAG Estático**. |
| 🤖 **Chatbot IA Inteligente** | Asistente de compras en vivo alimentado por Groq AI, normalizador de texto a prueba de errores de escritura ("ho.la", "ola") y memoria caché de respuestas. |
| 🔐 **Autenticación & Recuperación** | Registro, inicio de sesión, sesiones seguras en cookies y **Flujo de Recuperación de Contraseña ("Olvidaste tu contraseña")** en 2 pasos. |
| 🛒 **Carrito & Checkout** | Carrito de compras autenticado, cálculo de impuestos, envíos y cupones de descuento. Checkout directo con resumen detallado. |
| 👑 **Panel Administrativo** | Dashboard en `/admin` para gestión de productos, inventarios (stock), órdenes, clientes, categorías y cupones. |
| 📍 **Pie de Página Dinámico** | Dirección de la sala de exposición en Barranquilla (`+57 300 123-4567`), correo y ubicación actualizados dinámicamente desde el perfil del Administrador. |

---

## 🛡️ Seguridad y Protección Anti-DoS

El backend incluye múltiples capas de defensa para prevenir ataques de denegación de servicio (DoS / DDoS):

1. **Restricción de Payload (50kb)**:
   - Limita las solicitudes HTTP POST/PUT a un máximo de `50kb` para evitar ataques de agotamiento de memoria por desbordamiento de búfer (*Hash Collapse DoS*).
2. **Timeouts de Conexión y Keep-Alive**:
   - `server.setTimeout(10000)` (10 segundos) y `headersTimeout(15000)` para cortar inmediatamente ataques tipo *Slowloris*.
3. **Limitación de Tasa Adaptativa (`rateLimiter`)**:
   - Ráfagas restringidas por IP en rutas generales (100 req/15min), autenticación (10 req/15min) y asistente IA (15 req/10min).
4. **Sanitización de Búsqueda**:
   - Sanitización estricta de parámetros de búsqueda en `product.repository.ts` removiendo metacaracteres de expresiones regulares.

---

## ⚖️ Comparador Lado a Lado (50% / 50%)

Disponible en `/compare`:
- Permite seleccionar 2 productos del catálogo.
- Renderiza una vista en pantalla dividida (**50% Opción A / 50% Opción B**).
- Incluye el botón **Generar Análisis IA**, el cual despliega de forma **instantánea (< 20ms)** un reporte comparativo de 3 párrafos en español con precios en COP, materiales y veredicto de recomendación, con enriquecimiento asíncrono vía Groq API.

---


## 🚀 Rendimiento: Entorno Local vs Producción

- **¿Por qué en local se siente más lento?**:
  En entorno de desarrollo (`next dev`), Next.js compila los componentes de React *bajo demanda (JIT)* cada vez que haces clic o cambias de pestaña, sumado a la latencia de consultar la base de datos de Supabase en EE.UU. desde tu equipo local.
- **¿Cómo funcionará en producción?**:
  En producción (`next build` + `next start`), todas las páginas y assets se pre-compilan y sirven sobre redes CDN globales (Vercel/Cloudflare Edge), logrando una velocidad de respuesta **10 a 20 veces superior** (< 50ms).

---

## 👥 Cuentas de Demostración

| Rol | Correo Electrónico | Contraseña | Nombre | Ciudad |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@afcfurniture.com` | `Admin@1234` | **Alexis Flerez** | Barranquilla |
| **Cliente** | `customer@afcfurniture.com` | `Customer@1234` | **Felipe Flerez** | Barranquilla |

---

## 📄 Licencia

© 2026 AFC Furniture. Todos los derechos reservados.
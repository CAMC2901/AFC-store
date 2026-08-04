'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { IconZoom } from '@/components/ui/Icons';
import { Modal } from '@/components/ui/Modal';

/** Gallery with thumbnails + click/hover zoom. */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="lg:sticky lg:top-24">
      <div className="relative overflow-hidden rounded-3xl bg-mist">
        <div
          className="relative aspect-square w-full cursor-zoom-in"
          onMouseMove={onMove}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onClick={() => setZoom(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={images[active]}
                alt={`${name} — view ${active + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn(
                  'object-cover transition-transform duration-300',
                  zoom && 'scale-150'
                )}
                style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
              />
            </motion.div>
          </AnimatePresence>
          <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface/80 text-ink backdrop-blur">
            <IconZoom size={20} />
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl border-2 bg-mist transition-all',
                active === i ? 'border-gold' : 'border-transparent hover:border-line'
              )}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Modal open={zoom} onClose={() => setZoom(false)} title={name} maxWidth="max-w-4xl">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-mist">
          <Image src={images[active]} alt={name} fill sizes="900px" className="object-contain" />
        </div>
      </Modal>
    </div>
  );
}

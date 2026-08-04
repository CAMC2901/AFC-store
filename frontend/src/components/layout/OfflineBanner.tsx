'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed inset-x-0 top-0 z-[95] bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white"
          role="alert"
        >
          Estás sin conexión. Algunas funciones pueden no estar disponibles: revisa tu conexión.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
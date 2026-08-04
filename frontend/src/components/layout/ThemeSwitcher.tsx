'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { IconMoon, IconSun } from '@/components/ui/Icons';

export function ThemeSwitcher({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        className ??
        'relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist'
      }
      aria-label={theme === 'dark' ? 'Cambiar al tema claro' : 'Cambiar al tema oscuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className="relative block h-[22px] w-[22px]">
        <IconSun
          size={22}
          className="absolute inset-0 text-ink transition-all duration-300 dark:rotate-90 dark:scale-0 dark:opacity-0"
        />
        <IconMoon
          size={22}
          className="absolute inset-0 text-ink -rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100"
        />
      </span>
    </button>
  );
}
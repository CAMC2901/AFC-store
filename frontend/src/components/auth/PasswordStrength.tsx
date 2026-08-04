'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Strength {
  score: number;
  label: string;
  color: string;
}

const rules = [
  { re: /.{8,}/, label: '8+ caracteres' },
  { re: /[A-Z]/, label: 'Mayúscula' },
  { re: /[a-z]/, label: 'Minúscula' },
  { re: /[0-9]/, label: 'Número' },
  { re: /[^A-Za-z0-9]/, label: 'Carácter especial' },
];

export function evaluateStrength(password: string): Strength {
  const passed = rules.filter((r) => r.re.test(password)).length;
  const tiers = [
    { score: 0, label: 'Muy débil', color: 'bg-red-500' },
    { score: 1, label: 'Débil', color: 'bg-red-500' },
    { score: 2, label: 'Aceptable', color: 'bg-orange-400' },
    { score: 3, label: 'Buena', color: 'bg-yellow-400' },
    { score: 4, label: 'Fuerte', color: 'bg-emerald-500' },
    { score: 5, label: 'Muy fuerte', color: 'bg-emerald-500' },
  ];
  return tiers[passed];
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => evaluateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i < strength.score ? strength.color : 'bg-line')}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-medium text-charcoal">{strength.label}</p>
      <ul className="mt-1 grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
        {rules.map((rule) => {
          const ok = rule.re.test(password);
          return (
            <li key={rule.label} className={cn('text-[11px]', ok ? 'text-emerald-600' : 'text-charcoal/50')}>
              {ok ? '✓' : '○'} {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

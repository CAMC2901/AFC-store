'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconEye, IconEyeOff } from '@/components/ui/Icons';
import { getErrorMessage } from '@/lib/errors';
import { Logo } from '@/components/layout/Logo';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/account';
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(getErrorMessage(err, 'Correo electrónico o contraseña no válidos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <h1 className="font-display text-3xl">Bienvenido de nuevo</h1>
          <p className="mt-2 text-sm text-charcoal">Inicia sesión para continuar a tu cuenta.</p>
        </div>

        <form onSubmit={submit} className="card space-y-5 p-7">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-9 text-charcoal/60 hover:text-ink"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-charcoal">
              <input type="checkbox" className="h-4 w-4 accent-ink" /> Recuérdame
            </label>
            <Link href="/login" className="text-gold-dark hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Iniciar sesión <IconArrowRight size={16} />
          </Button>

          <div className="rounded-xl bg-mist p-3 text-xs text-charcoal/70">
            <p className="font-semibold text-ink">Cuentas de demostración</p>
            <p>Admin: admin@afcfurniture.com / Admin@1234</p>
            <p>Cliente: customer@afcfurniture.com / Customer@1234</p>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal">
          ¿Nuevo en AFC?{' '}
          <Link href="/register" className="font-semibold text-gold-dark hover:underline">
            Crea una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrength';
import { IconArrowRight, IconEye, IconEyeOff } from '@/components/ui/Icons';
import { getErrorMessage } from '@/lib/errors';
import { Logo } from '@/components/layout/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};

    if (form.password !== form.confirm) next.confirm = 'Las contraseñas no coinciden.';
    if (form.password.length < 8) {
      next.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      next.password = 'Debe contener mayúscula, minúscula, número y carácter especial.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Ingresa un correo electrónico válido.';
    if (form.firstName.trim().length < 2) next.firstName = 'El nombre es obligatorio.';
    if (form.lastName.trim().length < 2) next.lastName = 'El apellido es obligatorio.';

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setError('');
    setLoading(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      });
      router.push('/account');
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear tu cuenta.'));
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
          <h1 className="font-display text-3xl">Crea tu cuenta</h1>
          <p className="mt-2 text-sm text-charcoal">Únete a AFC para un pago más rápido, listas de favoritos y ofertas exclusivas.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-7">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" name="firstName" value={form.firstName} onChange={set('firstName')} error={errors.firstName} required />
            <Input label="Apellido" name="lastName" value={form.lastName} onChange={set('lastName')} error={errors.lastName} required />
          </div>

          <Input label="Correo electrónico" type="email" name="email" value={form.email} onChange={set('email')} error={errors.email} required autoComplete="email" />
          <Input label="Teléfono (opcional)" type="tel" name="phone" value={form.phone} onChange={set('phone')} />

          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-9 text-charcoal/60 hover:text-ink"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
            <PasswordStrengthMeter password={form.password} />
          </div>

          <Input
            label="Confirmar contraseña"
            type={showPassword ? 'text' : 'password'}
            name="confirm"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            required
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Crear cuenta <IconArrowRight size={16} />
          </Button>

          <p className="text-center text-xs text-charcoal/60">
            Al crear una cuenta aceptas nuestros Términos de servicio y Política de privacidad.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold text-gold-dark hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

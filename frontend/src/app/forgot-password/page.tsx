'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/services/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconArrowRight, IconCheck, IconEye, IconEyeOff, IconLock } from '@/components/ui/Icons';
import { getErrorMessage } from '@/lib/errors';
import { Logo } from '@/components/layout/Logo';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 states
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Step 2 states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const res = await AuthApi.forgotPassword(email);
      setInfoMessage(res.message);
      if (res.devResetToken) {
        setResetToken(res.devResetToken);
        toast.success(`Código de restablecimiento generado: ${res.devResetToken}`);
      } else {
        toast.success('Instrucciones enviadas a tu correo.');
      }
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err, 'Ocurrió un error al solicitar la recuperación.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const res = await AuthApi.resetPassword({
        email,
        resetToken,
        newPassword,
      });
      toast.success(res.message || 'Contraseña actualizada con éxito.');
      router.push('/login');
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo restablecer la contraseña. Verifica el código.'));
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
          <h1 className="font-display text-3xl">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-charcoal">
            {step === 1
              ? 'Ingresa tu correo para recibir las instrucciones de recuperación.'
              : 'Ingresa el código enviado y tu nueva contraseña.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="card space-y-5 p-7">
            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {error}
              </p>
            )}

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Enviar instrucciones <IconArrowRight size={16} />
            </Button>

            <div className="pt-2 text-center text-xs">
              <Link href="/login" className="font-semibold text-gold-dark hover:underline">
                ← Volver a inicio de sesión
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card space-y-5 p-7">
            {infoMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <p className="font-semibold flex items-center gap-1">
                  <IconCheck size={14} /> Solicitud recibida
                </p>
                <p className="mt-1">{infoMessage}</p>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300" role="alert">
                {error}
              </p>
            )}

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Código de recuperación"
              type="text"
              placeholder="Ej: AFC-X1Y2Z3"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Nueva contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
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

            <Input
              label="Confirmar nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth loading={loading} size="lg" variant="gold">
              Restablecer contraseña <IconLock size={16} />
            </Button>

            <div className="flex justify-between items-center pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-charcoal hover:underline"
              >
                Reenviar correo
              </button>
              <Link href="/login" className="font-semibold text-gold-dark hover:underline">
                Volver a inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { AccountApi } from '@/services/account';
import { AuthApi } from '@/services/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/app/account/components';
import { getErrorMessage } from '@/lib/errors';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await AccountApi.updateProfile(profile);
      setUser(updated);
      setProfile({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email, phone: updated.phone ?? '' });
      toast.success('Perfil actualizado.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('Las nuevas contraseñas no coinciden.');
      return;
    }
    setSavingPassword(true);
    try {
      await AuthApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Contraseña cambiada. Vuelve a iniciar sesión.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
      await useAuthStore.getState().logout();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" subtitle="Gestiona los detalles de tu cuenta." />

      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h2 className="font-display text-xl">Información personal</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} required />
          <Input label="Apellidos" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} required />
          <Input label="Correo electrónico" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
          <Input label="Teléfono" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </div>
        <Button type="submit" loading={saving}>Guardar cambios</Button>
      </form>

      <form onSubmit={savePassword} className="card space-y-4 p-6">
        <h2 className="font-display text-xl">Cambiar contraseña</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Contraseña actual" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
          <Input label="Nueva contraseña" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={8} />
          <Input label="Confirmar nueva contraseña" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required minLength={8} />
        </div>
        <Button type="submit" variant="outline" loading={savingPassword}>Actualizar contraseña</Button>
      </form>
    </div>
  );
}

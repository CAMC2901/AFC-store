'use client';

import { useEffect, useState } from 'react';
import { AccountApi } from '@/services/account';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/app/account/components';
import { IconPin, IconCheck, IconTrash } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import type { Address } from '@/types';
import toast from 'react-hot-toast';

const emptyForm = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Colombia',
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => AccountApi.addresses().then(setAddresses).catch(() => setAddresses([]));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await AccountApi.addAddress({
        ...form,
        line2: form.line2 || undefined,
      });
      setAddresses(updated);
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Dirección añadida con éxito.');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(String(msg || 'No se pudo añadir la dirección. Verifica los datos.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const updated = await AccountApi.removeAddress(id);
    setAddresses(updated);
    toast.success('Dirección eliminada.');
  };

  const setDefault = async (id: string) => {
    const updated = await AccountApi.setDefaultAddress(id);
    setAddresses(updated);
    toast.success('Dirección predeterminada actualizada.');
  };

  return (
    <div>
      <PageHeader
        title="Direcciones"
        subtitle="Gestiona tus direcciones de envío y facturación."
        action={
          <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'primary'}>
            {showForm ? 'Cancelar' : 'Añadir dirección'}
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={submit} className="card mb-6 space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Etiqueta" name="label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="p. ej. Casa" required />
            <Input label="País" name="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            <Input label="Dirección, línea 1" name="line1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required className="sm:col-span-2" />
            <Input label="Dirección, línea 2 (opcional)" name="line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="sm:col-span-2" />
            <Input label="Ciudad" name="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label="Estado" name="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
            <Input label="Código postal" name="postalCode" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="h-4 w-4 accent-ink" />
            Establecer como dirección predeterminada
          </label>
          <Button type="submit" loading={saving}>Guardar dirección</Button>
        </form>
      )}

      {addresses === null ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} className="text-gold" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<IconPin size={26} />}
          title="No hay direcciones guardadas"
          description="Añade una dirección para agilizar el pago."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  {addr.label}
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-dark">
                      <IconCheck size={11} /> Predeterminada
                    </span>
                  )}
                </span>
                <button
                  onClick={() => remove(addr.id)}
                  className="text-charcoal/40 transition-colors hover:text-red-500"
                  aria-label={`Eliminar ${addr.label}`}
                >
                  <IconTrash size={16} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-charcoal">
                {addr.line1}
                {addr.line2 && <><br />{addr.line2}</>}
                <br />
                {addr.city}, {addr.state} {addr.postalCode}
                <br />
                {addr.country}
              </p>
              {!addr.isDefault && (
                <button
                  onClick={() => setDefault(addr.id)}
                  className={cn('mt-4 text-xs font-semibold uppercase tracking-widest text-gold-dark hover:text-ink')}
                >
                  Hacer predeterminada
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/services/api';
import { Loader2, CheckCircle2, Save, Building, ShieldCheck } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
  domain: z.string().min(3, 'Domain minimal 3 karakter').regex(/^[a-z0-9-]+$/, 'Domain hanya boleh berisi huruf kecil, angka, dan tanda minus (-)'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      domain: '',
    },
  });

  const fetchTenantProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tenants/profile');
      setTenantInfo(response.data);
      setValue('name', response.data.name);
      setValue('domain', response.data.domain || '');
    } catch (err) {
      setErrorMsg('Gagal memuat profil perusahaan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantProfile();
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.patch('/tenants/profile', data);
      setTenantInfo(response.data);
      setSuccessMsg('Profil perusahaan berhasil disimpan.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan profil perusahaan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight">Profil Perusahaan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola informasi nama instansi dan kustomisasi subdomain bisnis Anda
        </p>
      </div>

      {successMsg && (
        <div className="bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg p-3.5 mb-5 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3.5 mb-5">
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Nama UMKM / Perusahaan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  className="w-full bg-input border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-sm"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="domain" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Subdomain Perusahaan
              </label>
              <div className="flex rounded-lg shadow-sm">
                <input
                  id="domain"
                  type="text"
                  className="w-full bg-input border border-border text-foreground px-4 py-2.5 rounded-l-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-sm border-r-0"
                  {...register('domain')}
                />
                <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-border bg-muted/30 text-muted-foreground text-sm">
                  .whatsbiz.com
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Ini akan menjadi domain khusus akses dashboard Anda (misal: toko-maju.whatsbiz.com)
              </p>
              {errors.domain && (
                <p className="text-xs text-destructive mt-1.5">{errors.domain.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md shadow-primary/10 flex items-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Perubahan
            </button>
          </form>
        </div>

        {/* Subscription Info Card */}
        <div className="bg-muted/10 border border-border/50 rounded-xl p-6 h-fit space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm">Detail Paket Langganan</h3>
          </div>
          
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Paket Aktif:</span>
              <span className="font-semibold text-primary">{tenantInfo?.plan || 'FREE'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Status Tenant:</span>
              <span className="font-semibold text-green-500">Active</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Pengguna:</span>
              <span className="font-semibold">{tenantInfo?._count?.users || 1} Anggota</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Pelanggan:</span>
              <span className="font-semibold">{tenantInfo?._count?.customers || 0} Kontak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

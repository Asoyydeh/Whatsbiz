'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/services/api';
import { Loader2, Plus, UserPlus, Shield, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(2, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'SALES', 'FINANCE'], {
    message: 'Pilih peran (role) yang valid',
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function TeamSettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STAFF',
    },
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setErrorMsg('Gagal memuat daftar anggota tim.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.post('/users', data);
      setIsModalOpen(false);
      reset();
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menambahkan anggota baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { is_active: !currentStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status pengguna.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MANAGER':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'STAFF':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SALES':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'FINANCE':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Manajemen Tim</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola hak akses dan peran karyawan yang menggunakan WhatsBiz CRM
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md shadow-primary/10 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Anggota
        </button>
      </div>

      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3.5 mb-5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Team Table */}
      <div className="overflow-x-auto border border-border/40 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/10 text-muted-foreground text-xs uppercase tracking-wider border-b border-border/40">
            <tr>
              <th className="px-6 py-3.5 font-medium">Nama Anggota</th>
              <th className="px-6 py-3.5 font-medium">Email</th>
              <th className="px-6 py-3.5 font-medium">Peran</th>
              <th className="px-6 py-3.5 font-medium">Status</th>
              <th className="px-6 py-3.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/35">
            {users.map((member) => (
              <tr key={member.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{member.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(member.role)}`}>
                    <Shield className="w-3 h-3" />
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center text-xs font-semibold ${member.is_active ? 'text-green-500' : 'text-muted-foreground/60'}`}>
                    {member.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleUserStatus(member.id, member.is_active)}
                    disabled={member.role === 'OWNER' && member.is_active}
                    title={member.role === 'OWNER' ? 'Peran owner utama tidak dapat dinonaktifkan' : 'Toggle Status Aktif'}
                    className={`text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {member.is_active ? (
                      <ToggleRight className="w-6 h-6 text-primary" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-[450px] rounded-xl border border-border shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Tambah Anggota Tim</h3>
                <p className="text-xs text-muted-foreground">Undang karyawan baru ke dalam tenant Anda</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Budi Setiawan"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                  {...register('name')}
                />
                {errors.name && <p className="text-xxs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Alamat Email</label>
                <input
                  type="email"
                  placeholder="budi@laundry.com"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                  {...register('email')}
                />
                {errors.email && <p className="text-xxs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Kata Sandi Default</label>
                <input
                  type="password"
                  placeholder="SandiDefaultKaryawan1!"
                  className="w-full bg-input border border-border text-foreground px-3 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs"
                  {...register('password')}
                />
                {errors.password && <p className="text-xxs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Peran Akses (Role)</label>
                <select
                  className="w-full bg-input border border-border text-foreground px-3 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs cursor-pointer"
                  {...register('role')}
                >
                  <option value="STAFF">STAFF (Hanya baca data CRM & kirim chat)</option>
                  <option value="MANAGER">MANAGER (Kelola CRM, Order, Invoice, & Tim)</option>
                  <option value="SALES">SALES (Kelola CRM, Order, & pesan)</option>
                  <option value="FINANCE">FINANCE (Kelola invoice & pembayaran)</option>
                </select>
                {errors.role && <p className="text-xxs text-destructive mt-1">{errors.role.message}</p>}
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md shadow-primary/10 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

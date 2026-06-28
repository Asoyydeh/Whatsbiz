'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageSquare, Lock, Mail, Loader2, CheckCircle2, User, Building } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const registerSchema = z.object({
  company_name: z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
  name: z.string().min(2, 'Nama lengkap wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerTenant, error: authError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      company_name: '',
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      await registerTenant({
        company_name: data.company_name,
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      setSuccessMsg('Registrasi berhasil! Mengalihkan ke login...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
          <MessageSquare className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 id="auth-title" className="text-2xl font-bold tracking-tight text-foreground">
          Daftar WhatsBiz
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Buat akun owner dan daftarkan perusahaan Anda
        </p>
      </div>

      {/* Alert Banner */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3.5 mb-5 flex items-start gap-2.5">
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg p-3.5 mb-5 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="company_name" className="text-sm font-medium text-muted-foreground mb-1 block">
            Nama UMKM / Perusahaan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
              <Building className="w-4 h-4" />
            </div>
            <input
              id="company_name"
              type="text"
              placeholder="Contoh: IG.STORE Laundry"
              disabled={isLoading}
              className={`w-full bg-input border ${
                errors.company_name ? 'border-destructive' : 'border-border'
              } text-foreground pl-10 pr-4 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-sm`}
              {...register('company_name')}
            />
          </div>
          {errors.company_name && (
            <p className="text-xs text-destructive mt-1">{errors.company_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="text-sm font-medium text-muted-foreground mb-1 block">
            Nama Lengkap Anda
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
              <User className="w-4 h-4" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Contoh: Budi Santoso"
              disabled={isLoading}
              className={`w-full bg-input border ${
                errors.name ? 'border-destructive' : 'border-border'
              } text-foreground pl-10 pr-4 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-sm`}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-muted-foreground mb-1 block">
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="nama@perusahaan.com"
              disabled={isLoading}
              className={`w-full bg-input border ${
                errors.email ? 'border-destructive' : 'border-border'
              } text-foreground pl-10 pr-4 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-sm`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-muted-foreground mb-1 block">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              disabled={isLoading}
              className={`w-full bg-input border ${
                errors.password ? 'border-destructive' : 'border-border'
              } text-foreground pl-10 pr-4 py-2 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-sm`}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          id="btn-register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mendaftarkan...
            </>
          ) : (
            'Buat Akun CRM'
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center mt-5 pt-5 border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

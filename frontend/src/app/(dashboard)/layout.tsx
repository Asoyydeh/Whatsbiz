'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ShoppingCart,
  FileText,
  Zap,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  User as UserIcon,
  Menu,
  X,
  Loader2,
  ChevronDown
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, checkSession, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-zinc-400 font-medium">Memuat Sesi WhatsBiz...</p>
        </div>
        <div className="hidden">{children}</div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-zinc-400 font-medium">Mengarahkan ke Login...</p>
        </div>
        <div className="hidden">{children}</div>
      </>
    );
  }

  const navItems = [
    { name: 'Dashboard AI', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Hubungkan WA', href: '/whatsapp-connect', icon: Zap },
    { name: 'Pengaturan AI Bot', href: '/ai-agent', icon: SettingsIcon },
    { name: 'Monitor Chat (Inbox)', href: '/inbox', icon: MessageSquare },
    { name: 'Daftar Kontak (CRM)', href: '/crm', icon: Users },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-zinc-800 bg-zinc-900 shrink-0">
        {/* Brand Logo */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary fill-primary" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            WhatsBiz AI Agent
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.email.split('@')[0]}</p>
              <p className="text-xs text-zinc-500 font-medium truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          
          <aside className="relative flex flex-col w-[260px] h-full bg-zinc-900 border-r border-zinc-800 animate-slide-in">
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 bg-zinc-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="h-16 px-6 border-b border-zinc-800 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary fill-primary" />
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                WhatsBiz AI Agent
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Footer Profile */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  {user?.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.email.split('@')[0]}</p>
                  <p className="text-xs text-zinc-500 font-medium truncate">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Right Area (Topbar + Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-zinc-500 font-medium">WhatsBiz</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-200 font-semibold capitalize">
                {pathname.split('/')[1] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search Bar Placeholder */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari fitur, kontak, order..."
                className="w-full bg-zinc-800/50 border border-zinc-700 text-zinc-200 pl-9 pr-4 py-1.5 rounded-lg outline-none text-xs focus:border-primary transition-all duration-200"
                disabled
              />
            </div>

            {/* Notification Button */}
            <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-zinc-800/80 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-sm">
                  {user?.email[0].toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg shadow-black/50 py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="text-xs text-zinc-500 font-medium">Masuk sebagai</p>
                      <p className="text-sm font-semibold truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/settings/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Pengaturan Profil
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar (Logout)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

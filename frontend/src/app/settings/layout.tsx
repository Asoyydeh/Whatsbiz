'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, ArrowLeft, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { hasPermission } = usePermission();

  const menuItems = [
    {
      name: 'Profil Perusahaan',
      href: '/settings/profile',
      icon: SettingsIcon,
      permission: 'tenant.manage',
    },
    {
      name: 'Manajemen Tim',
      href: '/settings/team',
      icon: Users,
      permission: 'team.manage',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">WhatsBiz Pengaturan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">WhatsBiz CRM</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Settings Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Settings Navigation Sidebar */}
        <aside className="w-full md:w-[240px] shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              // Hide menu item if user doesn't possess required permission
              if (!hasPermission(item.permission)) return null;
              
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <main className="flex-1 glass rounded-xl p-8 shadow-md">
          {children}
        </main>
      </div>
    </div>
  );
}

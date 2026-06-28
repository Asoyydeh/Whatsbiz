'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  TrendingUp,
  MessageSquare,
  Zap,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  Cpu,
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    total: 0,
    success: 0,
    fallbackCount: 0,
    failed: 0,
    avgLatency: 0,
    providerStats: {},
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<string>('DISCONNECTED');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch AI Stats
      const statsRes = await api.get('/ai/stats').catch(() => null);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }

      // 2. Fetch AI Logs
      const logsRes = await api.get('/ai/logs').catch(() => null);
      if (logsRes && logsRes.data) {
        setLogs(logsRes.data);
      }

      // 3. Fetch WA Status
      const waRes = await api.get('/whatsapp/status').catch(() => null);
      if (waRes && waRes.data) {
        setWaStatus(waRes.data.status);
        setActiveNumber(waRes.data.number);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalChats = stats.total || 0;
  const successRate = totalChats > 0 ? Math.round((stats.success / totalChats) * 100) : 0;
  const avgResponseTime = stats.avgLatency > 0 ? (stats.avgLatency / 1000).toFixed(2) : '0.00';
  const totalFallback = stats.fallbackCount || 0;

  const kpis = [
    {
      name: 'Total Chat Direspon AI',
      value: `${totalChats} Chat`,
      desc: 'Seluruh pesan masuk dari pelanggan',
      icon: MessageSquare,
      color: 'from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/20',
    },
    {
      name: 'Rasio Keberhasilan AI',
      value: `${successRate}%`,
      desc: 'Pesan berhasil dibalas otomatis',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    },
    {
      name: 'Peralihan Cadangan (Fallback)',
      value: `${totalFallback} Kali`,
      desc: 'Beralih ke LLM lain karena limit',
      icon: Layers,
      color: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20',
    },
    {
      name: 'Rata-rata Kecepatan Balas',
      value: `${avgResponseTime} Detik`,
      desc: 'Kecepatan respon perutean AI',
      icon: Clock,
      color: 'from-violet-500/20 to-purple-500/5 text-violet-400 border-violet-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Dashboard Performa Bot AI
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pantau performa balasan otomatis, kecepatan respon, dan log perutean AI fallback untuk WhatsApp UMKM Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {waStatus === 'CONNECTED' ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              WhatsApp Aktif: +{activeNumber}
            </div>
          ) : (
            <Link
              href="/whatsapp-connect"
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-4 py-2 rounded-xl text-red-400 text-xs font-semibold transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Hubungkan WhatsApp (Terputus)
            </Link>
          )}
          <Link
            href="/ai-agent"
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/10"
          >
            <Cpu className="w-3.5 h-3.5" />
            Pengaturan AI Bot
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${kpi.color} border rounded-2xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden`}
            >
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.name}</span>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-100">{kpi.value}</h3>
                <p className="text-[10.5px] text-zinc-500 font-medium">{kpi.desc}</p>
              </div>
              <div className="p-3 bg-zinc-950/20 border border-white/5 rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Stats Area: Graph & Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Mock/Real Analytics Chart Card */}
        <div className="xl:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Distribusi Perutean AI (LLM Hits)
              </h3>
              <p className="text-xs text-zinc-500">Statistik pemanggilan API per-provider</p>
            </div>
          </div>

          {/* Premium Visual Chart representing Provider distribution */}
          <div className="h-64 flex flex-col justify-end pt-4">
            <div className="flex-1 flex items-end justify-around border-b border-zinc-800 pb-4">
              {['gemini', 'groq', 'cohere', 'openrouter'].map((prov) => {
                const count = stats.providerStats?.[prov] || 0;
                const percent = totalChats > 0 ? (count / totalChats) * 100 : 0;
                
                // Mocks values just to look good if no real hits exist yet
                const displayPercent = totalChats === 0 
                  ? (prov === 'gemini' ? 70 : prov === 'groq' ? 20 : prov === 'cohere' ? 8 : 2)
                  : percent;

                const labelColor = 
                  prov === 'gemini' ? 'from-blue-500 to-indigo-500' :
                  prov === 'groq' ? 'from-emerald-500 to-teal-500' :
                  prov === 'cohere' ? 'from-violet-500 to-purple-500' : 'from-amber-500 to-orange-500';

                return (
                  <div key={prov} className="flex flex-col items-center gap-2 group cursor-pointer w-20">
                    <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-100 transition-colors">
                      {totalChats === 0 ? '0%' : `${displayPercent.toFixed(0)}%`}
                    </span>
                    <div
                      style={{ height: `${Math.max(displayPercent, 5)}%` }}
                      className={`w-10 bg-gradient-to-t ${labelColor} rounded-t-lg transition-all duration-500 group-hover:brightness-110`}
                    />
                    <span className="text-[10px] text-zinc-500 font-bold capitalize mt-1">
                      {prov}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Router Logs Feed */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[380px]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-400" />
              Log Perutean AI
            </h3>
            <span className="text-[9px] text-zinc-500 font-bold bg-zinc-950/40 border border-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Live Logs</span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 scrollbar-thin">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600">
                <Clock className="w-8 h-8 text-zinc-700/60 mb-1" />
                <p className="text-[11px] font-semibold">Belum Ada Riwayat Log</p>
                <p className="text-[9px] text-zinc-500 mt-0.5 max-w-[160px]">Log pemanggilan LLM akan muncul di sini.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b border-zinc-800/40 pb-3 last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs shrink-0 ${
                    log.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-200 capitalize flex items-center gap-1">
                        {log.provider}
                        {log.fallback_used && (
                          <span className="text-[8px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded uppercase">
                            Fallback
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {log.latency_ms}ms
                      </span>
                    </div>
                    {log.status === 'success' ? (
                      <p className="text-[10px] text-emerald-500/80 mt-0.5">Respon berhasil diformulasikan</p>
                    ) : (
                      <p className="text-[10px] text-red-400 mt-0.5 truncate" title={log.error_message}>
                        Error: {log.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Panel */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
        <h3 className="font-bold text-sm text-zinc-200 mb-4">Langkah Penggunaan Bot AI:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/whatsapp-connect"
            className="flex items-center gap-3 p-4 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl group transition-all"
          >
            <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-sm">1</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">Hubungkan WhatsApp</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-0.5">
                Scan QR Code untuk login <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </Link>

          <Link
            href="/ai-agent"
            className="flex items-center gap-3 p-4 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl group transition-all"
          >
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-sm">2</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">Atur Prompt & API Keys</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-0.5">
                Atur info toko & uji coba AI <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </Link>

          <Link
            href="/inbox"
            className="flex items-center gap-3 p-4 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl group transition-all"
          >
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-sm">3</span>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">Pantau Chat Masuk</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-0.5">
                Monitor balasan bot secara live <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

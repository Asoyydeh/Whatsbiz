'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut,
  Phone,
  HelpCircle,
  RefreshCw,
  Hash
} from 'lucide-react';

export default function WhatsappConnectPage() {
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { on, off } = useSocket();

  // Fetch status on mount
  const fetchStatus = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/whatsapp/status');
      setStatus(res.data.status);
      setQrCode(res.data.qr);
      setConnectedNumber(res.data.number);
      setPairingCode(res.data.pairingCode);
    } catch (err: any) {
      setErrorMsg('Gagal memuat status WhatsApp dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen to real-time status updates from Socket.IO
    on('whatsapp:status_update', (data: any) => {
      setStatus(data.status);
      setQrCode(data.qr);
      setConnectedNumber(data.number);
      setPairingCode(data.pairingCode);
    });

    return () => {
      off('whatsapp:status_update');
    };
  }, [on, off]);

  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/whatsapp/pairing-code', { phone: phoneNumber });
      setPairingCode(res.data.code);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal membuat pairing code.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState<boolean>(false);

  const handleDisconnect = async () => {
    if (!isConfirmingDisconnect) {
      setIsConfirmingDisconnect(true);
      setTimeout(() => setIsConfirmingDisconnect(false), 3000); // Reset after 3 seconds
      return;
    }
    
    setIsActionLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/whatsapp/logout');
      // Reset local state
      setStatus('DISCONNECTED');
      setQrCode(null);
      setPairingCode(null);
      setConnectedNumber(null);
      setIsConfirmingDisconnect(false);
    } catch (err: any) {
      setErrorMsg('Gagal memutuskan koneksi.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Hubungkan WhatsApp
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Hubungkan nomor WhatsApp Anda secara gratis menggunakan QR Code atau Pairing Code (tanpa Meta Cloud API).
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-zinc-400 font-medium">Memeriksa status WhatsApp...</p>
        </div>
      ) : status === 'CONNECTED' ? (
        /* Connected State */
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Terhubung
              </span>
              <h2 className="text-xl font-bold text-zinc-100">WhatsApp Aktif & Auto-Reply Siap</h2>
              <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-zinc-500" />
                Nomor Terhubung: <span className="font-semibold text-zinc-200">+{connectedNumber}</span>
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isActionLoading}
              className="flex items-center gap-2 bg-zinc-950 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              {isConfirmingDisconnect ? 'Yakin Putuskan?' : 'Putuskan Sesi WhatsApp'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-500/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Status Bot</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Bot AI siap mendengarkan semua pesan teks masuk dari kontak pribadi dan merespon secara otomatis menggunakan prompt bisnis Anda.
              </p>
            </div>
            <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Pemantauan</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Anda bisa melihat semua percakapan masuk dan respon otomatis AI secara real-time di halaman **"Monitor Chat"**.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Disconnected State */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Method 1: Scan QR Code */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
            
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Metode 1
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase">QR Code</span>
            </div>

            <h2 className="text-lg font-bold text-zinc-200 mb-2">Scan QR Code</h2>
            <p className="text-xs text-zinc-400 max-w-xs mb-6">
              Pindai kode QR menggunakan fitur Tautkan Perangkat (Linked Devices) di aplikasi WhatsApp HP Anda.
            </p>

            {/* QR Scanner Display */}
            <div className="w-72 h-72 bg-white border border-zinc-800 rounded-xl flex items-center justify-center relative p-2 shadow-lg">
              {status === 'QR_READY' && qrCode ? (
                <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] font-medium mt-1">Menunggu QR Code...</p>
                </div>
              )}
            </div>

            <div className="mt-8 w-full text-left bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-zinc-400 space-y-2">
              <p className="text-xs font-bold text-zinc-300">Cara Menghubungkan:</p>
              <ol className="text-[10.5px] list-decimal list-inside space-y-1">
                <li>Buka aplikasi <strong>WhatsApp</strong> di HP Anda.</li>
                <li>Pilih menu <strong>Pengaturan</strong> atau titik tiga di kanan atas.</li>
                <li>Klik <strong>Perangkat Tertaut</strong> &rarr; <strong>Tautkan Perangkat</strong>.</li>
                <li>Arahkan kamera HP Anda ke kode QR di atas.</li>
              </ol>
            </div>
          </div>

          {/* Method 2: Pairing Code (Nomor HP) */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Metode 2
              </span>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/80 border border-zinc-700 px-2.5 py-0.5 rounded-full uppercase">Pairing Code</span>
            </div>

            <div className="text-center md:text-left mb-6">
              <h2 className="text-lg font-bold text-zinc-200">Pairing Code Telepon</h2>
              <p className="text-xs text-zinc-400 mt-2">
                Hubungkan menggunakan nomor telepon dengan kode pairing 8 digit tanpa kamera.
              </p>
            </div>

            {pairingCode ? (
              /* Pairing Code Displayed */
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-xs text-zinc-400 mb-3">Masukkan kode ini di HP Anda:</p>
                <div className="flex items-center gap-2 bg-zinc-950 border border-primary/20 px-6 py-4 rounded-2xl shadow-inner mb-4 tracking-[0.2em] font-mono text-3xl font-extrabold text-primary">
                  {pairingCode}
                </div>
                <button
                  onClick={() => setPairingCode(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Hash className="w-3.5 h-3.5" />
                  Minta Ulang / Ganti Nomor
                </button>
              </div>
            ) : (
              /* Form input phone number */
              <form onSubmit={handleRequestPairingCode} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="text-xs font-semibold text-zinc-400 mb-1.5 block">
                    Nomor WhatsApp HP Anda
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="phone"
                      type="text"
                      placeholder="Contoh: 628123456789 (gunakan kode negara)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isActionLoading}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-all text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                    Pastikan nomor telepon diawali kode negara (misal 62 untuk Indonesia) dan nomor tersebut aktif.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isActionLoading || !phoneNumber}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Membuat Kode...
                    </>
                  ) : (
                    'Dapatkan Pairing Code'
                  )}
                </button>
              </form>
            )}

            <div className="mt-8 w-full text-left bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-zinc-400 space-y-2">
              <p className="text-xs font-bold text-zinc-300">Cara Penggunaan:</p>
              <ol className="text-[10.5px] list-decimal list-inside space-y-1">
                <li>Masukkan nomor WhatsApp lengkap Anda di atas.</li>
                <li>Klik tombol untuk mendapatkan 8-digit Pairing Code.</li>
                <li>Di WhatsApp HP: Masuk ke <strong>Perangkat Tertaut</strong> &rarr; <strong>Tautkan Perangkat</strong>.</li>
                <li>Pilih opsi <strong>Tautkan dengan nomor telepon saja</strong> di bawah pemindai QR.</li>
                <li>Masukkan 8 digit kode yang muncul di layar ini.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

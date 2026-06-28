'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  Settings,
  Bot,
  Key,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  MessageSquare,
  Sparkles,
  Info,
  Sliders,
  History
} from 'lucide-react';

export default function AiAgentConfigPage() {
  // Config state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [catalogData, setCatalogData] = useState<string>('');
  const [primaryProvider, setPrimaryProvider] = useState<string>('gemini');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [groqKey, setGroqKey] = useState<string>('');
  const [cohereKey, setCohereKey] = useState<string>('');
  const [openrouterKey, setOpenrouterKey] = useState<string>('');

  // Status state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Playground state
  const [playgroundMsg, setPlaygroundMsg] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isPlaygroundLoading, setIsPlaygroundLoading] = useState<boolean>(false);

  // Fetch config on mount
  const fetchConfig = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/ai/config');
      setIsActive(res.data.is_active);
      setSystemPrompt(res.data.system_prompt);
      setCatalogData(res.data.catalog_data || '');
      setPrimaryProvider(res.data.primary_provider);
      setTemperature(res.data.temperature || 0.7);
      setGeminiKey(res.data.gemini_api_key || '');
      setGroqKey(res.data.groq_api_key || '');
      setCohereKey(res.data.cohere_api_key || '');
      setOpenrouterKey(res.data.openrouter_key || '');
    } catch (err: any) {
      setErrorMsg('Gagal memuat konfigurasi AI Agent dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      await api.post('/ai/config', {
        is_active: isActive,
        system_prompt: systemPrompt,
        catalog_data: catalogData,
        primary_provider: primaryProvider,
        temperature,
        gemini_api_key: geminiKey,
        groq_api_key: groqKey,
        cohere_api_key: cohereKey,
        openrouter_key: openrouterKey,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg('Gagal menyimpan konfigurasi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPlaygroundMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playgroundMsg.trim()) return;

    const userMsg = playgroundMsg;
    setPlaygroundMsg('');
    const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newHistory);
    setIsPlaygroundLoading(true);

    try {
      const res = await api.post('/ai/test', {
        prompt: userMsg,
        history: chatHistory,
      });
      setChatHistory([...newHistory, { role: 'model' as const, content: res.data.response }]);
    } catch (err: any) {
      setChatHistory([
        ...newHistory,
        { role: 'model' as const, content: '[Gagal merespon dari API. Periksa kembali kunci API dan jaringan Anda.]' }
      ]);
    } finally {
      setIsPlaygroundLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Pengaturan AI Bot Agent
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Konfigurasikan prompt dasar, API keys gratis, perutean fallback, dan uji coba AI dalam playground interaktif.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">Konfigurasi AI Agent berhasil disimpan!</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-zinc-400 font-medium">Memuat konfigurasi AI...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Config Panel (grows) */}
          <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

            <form onSubmit={handleSave} className="space-y-6">
              {/* Bot Activation Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">Aktifkan WhatsApp AI Bot</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Nyalakan/matikan auto-reply otomatis untuk pesan masuk.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-white"></div>
                </label>
              </div>

              {/* System Prompt / Knowledge Base */}
              <div className="space-y-2">
                <label htmlFor="system-prompt" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  System Prompt (Knowledge Base / Instruksi Bot)
                </label>
                <textarea
                  id="system-prompt"
                  rows={6}
                  placeholder="Contoh: Anda adalah asisten AI toko online 'Warung Roti Sri'. Kami menjual Roti Coklat Rp10.000, Roti Keju Rp12.000. Toko buka pukul 09.00-21.00 WIB. Jawab pertanyaan pembeli secara ramah dan tawarkan mereka untuk order."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-xs font-sans leading-relaxed"
                />
                <div className="flex items-start gap-1.5 text-[10px] text-zinc-500 bg-zinc-950/20 border border-zinc-850 p-3 rounded-lg leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  Tulis aturan bot Anda secara spesifik di sini (nama bisnis, produk, harga, metode pengiriman/pembayaran, dsb). Prompt ini akan memandu AI dalam membalas chat secara akurat.
                </div>
              </div>

              {/* Catalog Data */}
              <div className="space-y-2 pt-4 border-t border-zinc-850">
                <label htmlFor="catalog-data" className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Data Katalog (Produk & Gambar)
                </label>
                <textarea
                  id="catalog-data"
                  rows={6}
                  placeholder="Paste katalog produk Anda di sini (misal dari Excel/Notepad).&#10;Contoh:&#10;1. Kemeja Pria Putih - Rp 150.000 - [GAMBAR: https://link-gambar.com/kemeja.jpg]&#10;2. Celana Jeans - Rp 250.000 - [GAMBAR: https://link-gambar.com/jeans.jpg]"
                  value={catalogData}
                  onChange={(e) => setCatalogData(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-xl outline-none focus:border-primary transition-all text-xs font-sans leading-relaxed"
                />
                <div className="flex items-start gap-1.5 text-[10px] text-zinc-500 bg-zinc-950/20 border border-zinc-850 p-3 rounded-lg leading-relaxed">
                  <Info className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  Gunakan field ini khusus untuk menempelkan daftar produk, harga, dan link gambar asli Anda. AI akan merujuk ke data ini sebelum membalas!
                </div>
              </div>

              {/* AI Settings Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-850">
                <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  Konfigurasi LLM Router
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Provider */}
                  <div>
                    <label htmlFor="provider" className="text-xs text-zinc-400 mb-1.5 block">Penyedia LLM Utama</label>
                    <select
                      id="provider"
                      value={primaryProvider}
                      onChange={(e) => setPrimaryProvider(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl outline-none text-xs focus:border-primary transition-all font-semibold"
                    >
                      <option value="gemini">Google Gemini (Recommended)</option>
                      <option value="groq">Groq AI (Llama 3)</option>
                      <option value="cohere">Cohere Command</option>
                      <option value="openrouter">OpenRouter (Free Models)</option>
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-zinc-400">Kreativitas (Temperature)</label>
                      <span className="text-[10px] font-mono text-zinc-500">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-zinc-950 rounded-lg appearance-none h-2 cursor-pointer border border-zinc-800"
                    />
                  </div>
                </div>
              </div>

              {/* API Keys Configuration */}
              <div className="space-y-4 pt-4 border-t border-zinc-850">
                <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-zinc-400" />
                  Kunci API Gratis (API Keys)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gemini Key */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 block font-semibold">Gemini API Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl outline-none text-xs focus:border-primary transition-all font-mono"
                    />
                  </div>

                  {/* Groq Key */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 block font-semibold">Groq API Key</label>
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl outline-none text-xs focus:border-primary transition-all font-mono"
                    />
                  </div>

                  {/* Cohere Key */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 block font-semibold">Cohere API Key</label>
                    <input
                      type="password"
                      placeholder="co_..."
                      value={cohereKey}
                      onChange={(e) => setCohereKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl outline-none text-xs focus:border-primary transition-all font-mono"
                    />
                  </div>

                  {/* OpenRouter Key */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 block font-semibold">OpenRouter API Key</label>
                    <input
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={openrouterKey}
                      onChange={(e) => setOpenrouterKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl outline-none text-xs focus:border-primary transition-all font-mono"
                    />
                  </div>
                </div>
                
                <div className="text-[10px] text-zinc-500 leading-relaxed">
                  Masukkan minimal <strong>satu API Key</strong> untuk menggunakan bot. Semakin banyak kunci yang dimasukkan, bot akan semakin tahan dari masalah limit kuota karena perutean fallback akan berjalan maksimal.
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-zinc-850">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan Konfigurasi...
                    </>
                  ) : (
                    'Simpan Pengaturan AI'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: AI Playground */}
          <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[650px] relative overflow-hidden">
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

            {/* Title / Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-850 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <h3 className="text-sm font-bold text-zinc-200">Playground AI (Uji Coba)</h3>
              </div>
              <button
                onClick={handleClearChat}
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
              >
                Reset Chat
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <MessageSquare className="w-10 h-10 text-zinc-700/60 mb-2" />
                  <p className="text-xs font-semibold">Mulai Uji Coba Asisten AI</p>
                  <p className="text-[10px] text-zinc-500 mt-1 max-w-[220px]">
                    Ketik pesan untuk mensimulasikan bagaimana bot menjawab pertanyaan pelanggan menggunakan prompt Anda.
                  </p>
                </div>
              ) : (
                chatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[9px] text-zinc-500 font-bold mb-1 uppercase tracking-wider px-1">
                      {chat.role === 'user' ? 'Pelanggan' : 'AI Agent'}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed leading-normal ${
                        chat.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-tl-none'
                      }`}
                    >
                      {chat.content}
                    </div>
                  </div>
                ))
              )}

              {isPlaygroundLoading && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] text-zinc-500 font-bold mb-1 uppercase tracking-wider px-1">AI Agent</span>
                  <div className="bg-zinc-800 border border-zinc-750 text-zinc-500 text-xs px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    AI sedang merespon...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendPlaygroundMsg} className="flex gap-2 flex-shrink-0 mt-auto">
              <input
                type="text"
                placeholder="Ketik pesan tes ke AI..."
                value={playgroundMsg}
                onChange={(e) => setPlaygroundMsg(e.target.value)}
                disabled={isPlaygroundLoading}
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-xl outline-none focus:border-primary text-xs"
              />
              <button
                type="submit"
                disabled={isPlaygroundLoading || !playgroundMsg.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold p-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                title="Kirim"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

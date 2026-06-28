'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Loader2,
  Trash2,
  Edit2,
  Clock,
  X,
  FileText,
  Tag,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const customerSchema = z.object({
  name: z.string().min(2, 'Nama minimal terdiri dari 2 karakter'),
  phone: z.string().min(5, 'Nomor telepon minimal terdiri dari 5 karakter'),
  email: z.string().email('Format email tidak valid').or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'VIP', 'INACTIVE', 'LOST']),
  tagsInput: z.string().optional(), // separated by comma or semicolon
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CRMPage() {
  // State variables
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [limit] = useState(10);
  
  // Loading states
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [csvContentInput, setCsvContentInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tab control in right panel
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'messages' | 'payments' | 'tasks'>('overview');

  // React Hook Form for Create/Edit
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'LEAD',
      tagsInput: '',
    },
  });

  // Fetch customer list
  const fetchCustomers = async () => {
    setIsListLoading(true);
    try {
      let url = `/customers?page=${page}&limit=${limit}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (tagFilter) url += `&tag=${encodeURIComponent(tagFilter)}`;
      
      const res = await api.get(url);
      setCustomers(res.data.data);
      setTotalCustomers(res.data.meta.total);

      // Select first customer if none is selected
      if (res.data.data.length > 0 && !selectedCustId) {
        setSelectedCustId(res.data.data[0].id);
      } else if (res.data.data.length === 0) {
        setSelectedCustomer(null);
        setSelectedCustId(null);
      }
    } catch (err) {
      console.error('Gagal mengambil data pelanggan', err);
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch individual customer details and timeline
  const fetchCustomerDetails = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      setSelectedCustomer(res.data);
      setTimeline(res.data.timeline || []);
    } catch (err) {
      console.error('Gagal mengambil detail pelanggan', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, statusFilter, tagFilter, page]);

  useEffect(() => {
    if (selectedCustId) {
      fetchCustomerDetails(selectedCustId);
    }
  }, [selectedCustId]);

  // Handle Form submit (Create or Edit)
  const onSubmitForm = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      const tagsArray = data.tagsInput
        ? data.tagsInput.split(/[;,]/).map((t) => t.trim()).filter((t) => t.length > 0)
        : [];
      
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        status: data.status,
        tags: tagsArray,
      };

      if (editingCustomer) {
        // Edit Customer
        const res = await api.patch(`/customers/${editingCustomer.id}`, payload);
        setSelectedCustomer(res.data);
        setEditingCustomer(null);
        setIsFormModalOpen(false);
        fetchCustomers();
        // re-fetch details
        fetchCustomerDetails(res.data.id);
      } else {
        // Create Customer
        const res = await api.post('/customers', payload);
        setSelectedCustId(res.data.id);
        setIsFormModalOpen(false);
        setPage(1);
        fetchCustomers();
      }
      reset();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan data pelanggan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Edit Form Modal
  const openEditModal = () => {
    if (!selectedCustomer) return;
    setEditingCustomer(selectedCustomer);
    setValue('name', selectedCustomer.name);
    setValue('phone', selectedCustomer.phone);
    setValue('email', selectedCustomer.email || '');
    setValue('address', selectedCustomer.address || '');
    setValue('status', selectedCustomer.status);
    
    const tagsStr = selectedCustomer.tags ? selectedCustomer.tags.map((t: any) => t.tag).join(', ') : '';
    setValue('tagsInput', tagsStr);
    
    setIsFormModalOpen(true);
  };

  // Trigger Create Form Modal
  const openCreateModal = () => {
    setEditingCustomer(null);
    reset({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'LEAD',
      tagsInput: '',
    });
    setIsFormModalOpen(true);
  };

  // Soft Delete Customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menonaktifkan pelanggan "${selectedCustomer.name}"?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/customers/${selectedCustomer.id}`);
      setSelectedCustId(null);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Gagal menonaktifkan pelanggan.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let url = `${api.defaults.baseURL}/customers/export`;
    
    // Add auth header manually or trigger standard download through fetch
    const accessToken = localStorage.getItem('access_token');
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    .then((res) => res.blob())
    .then((blob) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'daftar_pelanggan.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((err) => {
      console.error(err);
      alert('Gagal mengekspor file CSV.');
    });
  };

  // Import CSV (handling either text content or multi-part)
  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/customers/import', {
        csv_content: csvContentInput
      });
      setUploadSuccess(`Sukses mengimpor ${res.data.count} pelanggan.`);
      setCsvContentInput('');
      fetchCustomers();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setUploadSuccess(null);
      }, 2000);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Format CSV tidak valid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Badge Colors
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'LEAD': return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'PROSPECT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CUSTOMER': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'VIP': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'INACTIVE': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
      case 'LOST': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Manajemen Pelanggan (CRM)
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar, saring, impor dan kelola seluruh relasi pembeli WhatsBiz Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Impor
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-md shadow-primary/10"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Kontak
          </button>
        </div>
      </div>

      {/* Main split dashboard area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Side: Search, Filters & Customer List */}
        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col overflow-hidden">
          {/* Search box & filter actions */}
          <div className="p-4 border-b border-zinc-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, telepon, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-zinc-950/40 border border-zinc-800 text-zinc-200 pl-9 pr-4 py-2 rounded-lg outline-none text-xs focus:border-primary transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Status filter dropdown */}
              <div className="relative">
                <Filter className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-zinc-950/40 border border-zinc-800 text-zinc-400 pl-7 pr-2 py-1.5 rounded-lg outline-none text-[10px] focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="LEAD">Lead</option>
                  <option value="PROSPECT">Prospect</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="VIP">VIP</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              {/* Tag filter input */}
              <div className="relative">
                <Tag className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Saring Tag"
                  value={tagFilter}
                  onChange={(e) => {
                    setTagFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-zinc-950/40 border border-zinc-800 text-zinc-200 pl-7 pr-2 py-1.5 rounded-lg outline-none text-[10px] focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Customer list container */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {isListLoading ? (
              <div className="h-full flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Tidak ada data pelanggan ditemukan.
              </div>
            ) : (
              customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustId(c.id)}
                  className={`p-3.5 cursor-pointer hover:bg-zinc-800/20 transition-all border-l-2 ${
                    selectedCustId === c.id
                      ? 'bg-zinc-800/40 border-primary text-zinc-100'
                      : 'border-transparent text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-200 truncate">{c.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getStatusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 truncate">{c.phone}</p>
                  
                  {/* Tag chips */}
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {c.tags.slice(0, 3).map((t: any) => (
                        <span key={t.id} className="text-[8px] bg-zinc-800 border border-zinc-700/80 text-zinc-400 px-1 py-0.5 rounded">
                          {t.tag}
                        </span>
                      ))}
                      {c.tags.length > 3 && (
                        <span className="text-[8px] text-zinc-500 font-semibold px-1 py-0.5">+{c.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Simple Pagination bar */}
          {totalCustomers > limit && (
            <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 bg-zinc-950/20">
              <button
                disabled={page <= 1 || isListLoading}
                onClick={() => setPage(page - 1)}
                className="text-[10px] font-bold px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-zinc-200 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="text-[10px] text-zinc-500 font-medium">Halaman {page} dari {Math.ceil(totalCustomers / limit)}</span>
              <button
                disabled={page >= Math.ceil(totalCustomers / limit) || isListLoading}
                onClick={() => setPage(page + 1)}
                className="text-[10px] font-bold px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg hover:text-zinc-200 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Profile, Status actions & Timeline */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col overflow-hidden">
          {isDetailLoading && !selectedCustomer ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !selectedCustomer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2.5 p-8">
              <User className="w-10 h-10 text-zinc-700" />
              <p className="text-xs">Silakan pilih pelanggan dari daftar untuk melihat detail lengkap.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Profile header with actions */}
              <div className="p-6 border-b border-zinc-800 bg-zinc-950/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-lg">
                    {selectedCustomer.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-bold text-zinc-100">{selectedCustomer.name}</h2>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusBadgeClass(selectedCustomer.status)}`}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedCustomer.tags && selectedCustomer.tags.map((t: any) => (
                        <span key={t.id} className="text-[8px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-zinc-600" />
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={openEditModal}
                    className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
                    title="Ubah Kontak"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteCustomer}
                    className="p-2 text-red-500 hover:text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg hover:bg-red-500/10 transition-all"
                    title="Hapus Kontak"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid Overview Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
                <div className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-zinc-950/60 rounded-lg text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold">Telepon / WhatsApp</p>
                    <p className="text-xs text-zinc-200 mt-0.5">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-zinc-950/60 rounded-lg text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 font-bold">Email</p>
                    <p className="text-xs text-zinc-200 mt-0.5 truncate">{selectedCustomer.email || '-'}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-zinc-950/60 rounded-lg text-zinc-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 font-bold">Alamat</p>
                    <p className="text-xs text-zinc-200 mt-0.5 truncate">{selectedCustomer.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* CRM Tabs */}
              <div className="border-b border-zinc-800 bg-zinc-950/10 flex">
                {(['overview', 'orders', 'messages', 'payments', 'tasks'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab === 'overview' ? 'Timeline' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-zinc-400">Riwayat Aktivitas & Catatan</h4>
                    </div>

                    {timeline.length === 0 ? (
                      <p className="text-xs text-zinc-600">Tidak ada riwayat aktivitas yang tercatat.</p>
                    ) : (
                      <div className="relative border-l-2 border-zinc-800 ml-3.5 pl-6 space-y-6">
                        {timeline.map((event) => (
                          <div key={event.id} className="relative">
                            {/* Point indicator */}
                            <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center text-[7px]" />
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-300">{event.title}</span>
                                <span className="text-[9px] text-zinc-500 font-medium">
                                  {new Date(event.timestamp).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-400 mb-2">Daftar Transaksi Pesanan</h4>
                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                      <div className="border border-zinc-800/80 rounded-xl overflow-hidden divide-y divide-zinc-850">
                        {selectedCustomer.orders.map((order: any) => (
                          <div key={order.id} className="p-3.5 bg-zinc-950/10 flex items-center justify-between text-xs hover:bg-zinc-800/10">
                            <div>
                              <p className="font-bold text-zinc-200">#{order.order_number}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-zinc-200">Rp {order.total.toLocaleString('id-ID')}</p>
                              <span className="inline-block text-[9px] font-bold text-primary mt-1 border border-primary/20 bg-primary/5 px-1.5 py-0.2 rounded uppercase">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600">Pelanggan ini belum melakukan transaksi pesanan.</p>
                    )}
                  </div>
                )}

                {activeTab === 'messages' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-400 mb-2">Riwayat Obrolan Terakhir</h4>
                    <p className="text-xs text-zinc-600">Fitur perpesanan akan terintegrasi langsung dengan WhatsApp Inbox.</p>
                    <a
                      href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Hubungi di WhatsApp
                    </a>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-400 mb-2">Riwayat Pembayaran</h4>
                    <p className="text-xs text-zinc-600">Belum ada riwayat pembayaran yang tercatat untuk pelanggan ini.</p>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-400 mb-2">Follow-up & Tugas</h4>
                    <p className="text-xs text-zinc-600">Belum ada tugas follow-up yang dijadwalkan.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal (Create or Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-xl shadow-black/80 animate-scale-in">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-zinc-100">{editingCustomer ? 'Ubah Profil Pelanggan' : 'Tambah Kontak Baru'}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">Nama Pelanggan *</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-lg outline-none text-xs focus:border-primary transition-all"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">WhatsApp / Telepon *</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-lg outline-none text-xs focus:border-primary transition-all"
                    {...register('phone')}
                  />
                  {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">Alamat Email</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-lg outline-none text-xs focus:border-primary transition-all"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 mb-1 block">Status Pelanggan</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 px-3.5 py-2 rounded-lg outline-none text-xs focus:border-primary cursor-pointer"
                    {...register('status')}
                  >
                    <option value="LEAD">Lead</option>
                    <option value="PROSPECT">Prospect</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="VIP">VIP</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">Alamat Rumah / Kantor</label>
                <textarea
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-lg outline-none text-xs focus:border-primary transition-all"
                  {...register('address')}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 mb-1 block">Tag / Label (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="VIP, Retail, Promo"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-lg outline-none text-xs focus:border-primary transition-all"
                  {...register('tagsInput')}
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 font-bold hover:text-zinc-200 text-xs rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-xl shadow-black/80 animate-scale-in">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-zinc-100">Impor Kontak CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportCSV} className="p-6 space-y-4">
              <div className="bg-zinc-950/40 p-4 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 space-y-2">
                <p className="font-bold text-zinc-300">Format CSV yang valid:</p>
                <code className="block bg-zinc-950 p-2 border border-zinc-900 rounded font-mono text-[9px] text-primary">
                  name,phone,email,address,status,tags<br />
                  Budi Santoso,081234567,budi@mail.com,Jl. Sudirman,LEAD,Retail;Diskon
                </code>
                <p className="text-[10px] text-zinc-500 mt-1">Gunakan titik koma (;) untuk memisahkan daftar tag di kolom tags.</p>
              </div>

              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{uploadSuccess}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-400 mb-2 block">Masukkan Konten CSV Teks</label>
                <textarea
                  rows={6}
                  placeholder="name,phone,email,address,status,tags&#10;Siti,081999888,siti@mail.com,Jl. Senopati,CUSTOMER,VIP;Loyal"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-lg outline-none font-mono text-[10px] focus:border-primary transition-all"
                  value={csvContentInput}
                  onChange={(e) => setCsvContentInput(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 font-bold hover:text-zinc-200 text-xs rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !csvContentInput.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mengimpor...
                    </>
                  ) : (
                    'Proses Impor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

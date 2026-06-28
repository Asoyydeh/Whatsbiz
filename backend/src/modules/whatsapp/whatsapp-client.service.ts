import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChatGateway } from '../messages/chat.gateway';
import { AiService } from '../ai/ai.service';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  ConnectionState,
} from '@whiskeysockets/baileys';
import * as path from 'path';
import * as fs from 'fs';
import * as QRCode from 'qrcode';
import pino from 'pino';

export type WhatsappStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_READY';

@Injectable()
export class WhatsappClientService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappClientService.name);
  
  // Maps to store credentials and sockets per tenant
  private socks = new Map<string, any>();
  private statuses = new Map<string, WhatsappStatus>();
  private qrCodeUrls = new Map<string, string | null>();
  private connectedNumbers = new Map<string, string | null>();
  private pairingCodes = new Map<string, string | null>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => AiService))
    private readonly aiService: AiService,
  ) {}

  async onModuleInit() {
    this.logger.log('Menginisialisasi WhatsApp Baileys Client untuk seluruh tenant...');
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { is_active: true }
      });
      
      this.logger.log(`Ditemukan ${tenants.length} tenant aktif.`);
      
      for (const tenant of tenants) {
        this.logger.log(`Memulai WhatsApp Client untuk Tenant: ${tenant.name} (${tenant.id})`);
        this.startWhatsapp(tenant.id).catch((err) => {
          this.logger.error(`Gagal memulai WhatsApp Client untuk Tenant ${tenant.name}:`, err);
        });
      }
    } catch (err) {
      this.logger.error('Gagal memuat tenant saat inisialisasi WhatsApp:', err);
    }
  }

  getStatus(tenantId: string = 'default') {
    return {
      status: this.statuses.get(tenantId) || 'DISCONNECTED',
      qr: this.qrCodeUrls.get(tenantId) || null,
      number: this.connectedNumbers.get(tenantId) || null,
      pairingCode: this.pairingCodes.get(tenantId) || null,
    };
  }

  private getSessionPath(tenantId: string): string {
    return path.join(process.cwd(), 'sessions', `whatsapp-session-${tenantId}`);
  }

  private async startWhatsapp(tenantId: string = 'default') {
    this.statuses.set(tenantId, 'CONNECTING');
    this.broadcastStatus(tenantId);

    const sessionDir = this.getSessionPath(tenantId);
    
    // Ensure sessions directory exists
    const sessionsRoot = path.join(process.cwd(), 'sessions');
    if (!fs.existsSync(sessionsRoot)) {
      fs.mkdirSync(sessionsRoot, { recursive: true });
    }
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // Don't spam terminal
      logger: pino({ level: 'silent' }),
      browser: ['Windows', 'Chrome', '110.0.0.0'], // Menggunakan nama OS standar agar tidak diblokir WhatsApp
    });

    this.socks.set(tenantId, sock);

    sock.ev.on('creds.update', async () => {
      try {
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }
        await saveCreds();
      } catch (err) {
        this.logger.error(`[Tenant ${tenantId}] Gagal menyimpan credentials (creds.update):`, err);
      }
    });

    sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.statuses.set(tenantId, 'QR_READY');
        try {
          const qrCodeUrl = await QRCode.toDataURL(qr);
          this.qrCodeUrls.set(tenantId, qrCodeUrl);
          this.broadcastStatus(tenantId);
        } catch (err) {
          this.logger.error(`[Tenant ${tenantId}] Gagal membuat QR Code image:`, err);
        }
      }

      if (connection === 'close') {
        this.qrCodeUrls.set(tenantId, null);
        this.connectedNumbers.set(tenantId, null);
        this.pairingCodes.set(tenantId, null);

        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut &&
          statusCode !== DisconnectReason.connectionReplaced;
        
        this.logger.warn(
          `[Tenant ${tenantId}] Koneksi terputus. Alasan: ${lastDisconnect?.error?.message || 'Unknown'}. Status Code: ${statusCode}. Reconnect: ${shouldReconnect}`,
        );

        if (shouldReconnect) {
          this.statuses.set(tenantId, 'CONNECTING');
          this.broadcastStatus(tenantId);
          setTimeout(() => this.startWhatsapp(tenantId), 5000);
        } else {
          this.statuses.set(tenantId, 'DISCONNECTED');
          this.broadcastStatus(tenantId);
          
          if (statusCode === DisconnectReason.loggedOut) {
            this.clearSessionFolder(tenantId);
            this.logger.log(`[Tenant ${tenantId}] Sesi keluar (Logged Out) oleh WhatsApp HP. Folder sesi dibersihkan.`);
          } else {
            this.logger.log(`[Tenant ${tenantId}] Koneksi ditutup (Status: ${statusCode}). Sesi tetap disimpan.`);
          }
          this.socks.delete(tenantId);
        }
      } else if (connection === 'open') {
        this.statuses.set(tenantId, 'CONNECTED');
        this.qrCodeUrls.set(tenantId, null);
        this.pairingCodes.set(tenantId, null);
        
        const rawUser = sock.user?.id || '';
        const connectedNumber = rawUser.split(':')[0];
        this.connectedNumbers.set(tenantId, connectedNumber);
        
        this.logger.log(`[Tenant ${tenantId}] WhatsApp terhubung dengan nomor: ${connectedNumber}`);
        this.broadcastStatus(tenantId);
      }
    });

    sock.ev.on('messages.upsert', async (m: any) => {
      const msg = m.messages[0];
      if (
        !msg.message ||
        msg.key.fromMe ||
        msg.key.remoteJid.includes('@g.us') ||
        msg.key.remoteJid === 'status@broadcast'
      ) {
        return;
      }

      const remoteJid = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        '';

      if (!text.trim()) return;

      const phone = remoteJid.split('@')[0];
      this.logger.log(`[Tenant ${tenantId}] Menerima pesan dari ${phone}: "${text}"`);

      try {
        await this.handleIncomingMessage(tenantId, phone, text, msg);
      } catch (err) {
        this.logger.error(`[Tenant ${tenantId}] Error memproses pesan masuk:`, err);
      }
    });

    // Handle Contact Sync
    sock.ev.on('contacts.upsert', async (contacts) => {
      this.logger.log(`[Tenant ${tenantId}] Sinkronisasi ${contacts.length} kontak...`);
      for (const contact of contacts) {
        if (!contact.id.endsWith('@s.whatsapp.net')) continue;
        const phone = contact.id.split('@')[0];
        const name = contact.name || contact.notify || `WhatsApp User ${phone}`;
        
        const existing = await this.prisma.customer.findFirst({
          where: { tenant_id: tenantId, phone: { contains: phone } }
        });
        
        if (!existing) {
          await this.prisma.customer.create({
            data: {
              tenant_id: tenantId,
              name: name,
              phone: phone,
              status: 'LEAD',
            }
          });
        }
      }
    });

    // Handle Message History Sync (Saat pertama kali connect via Pairing Code)
    sock.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
      this.logger.log(`[Tenant ${tenantId}] Sinkronisasi Riwayat: ${chats.length} chat, ${contacts.length} kontak, ${messages.length} pesan.`);
      // Sync contacts
      for (const contact of contacts) {
        if (!contact.id.endsWith('@s.whatsapp.net')) continue;
        const phone = contact.id.split('@')[0];
        const name = contact.name || contact.notify || `WhatsApp User ${phone}`;
        
        const existing = await this.prisma.customer.findFirst({
          where: { tenant_id: tenantId, phone: { contains: phone } }
        });
        if (!existing) {
          await this.prisma.customer.create({
            data: { tenant_id: tenantId, name, phone, status: 'LEAD' }
          });
        }
      }
      
      // We process the latest messages to create conversations
      for (const msg of messages) {
        if (!msg.message || msg.key.remoteJid?.includes('@g.us') || msg.key.remoteJid === 'status@broadcast') continue;
        const phone = msg.key.remoteJid?.split('@')[0];
        if (!phone) continue;
        
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        if (!text) continue;

        let customer = await this.prisma.customer.findFirst({
          where: { tenant_id: tenantId, phone: { contains: phone } }
        });
        
        if (!customer) {
          customer = await this.prisma.customer.create({
            data: { tenant_id: tenantId, name: `WhatsApp User ${phone}`, phone, status: 'LEAD' }
          });
        }

        const conversation = await this.getOrCreateConversation(tenantId, customer.id);
        
        // Cek apakah pesan sudah ada
        const existingMsg = await this.prisma.message.findFirst({
          where: { tenant_id: tenantId, content: text, created_at: new Date((msg.messageTimestamp as number) * 1000) }
        });

        if (!existingMsg) {
          await this.prisma.message.create({
            data: {
              tenant_id: tenantId,
              conversation_id: conversation.id,
              sender_id: msg.key.fromMe ? 'OWNER' : null,
              type: 'TEXT',
              content: text,
              status: msg.key.fromMe ? 'sent' : 'delivered',
              created_at: new Date((msg.messageTimestamp as number) * 1000)
            }
          });
        }
      }
      this.logger.log(`[Tenant ${tenantId}] Sinkronisasi Riwayat Selesai.`);
    });
  }

  private broadcastStatus(tenantId: string) {
    const statusData = this.getStatus(tenantId);
    if (this.chatGateway?.server) {
      this.chatGateway.server.to(`tenant:${tenantId}`).emit('whatsapp:status_update', statusData);
    }
  }

  private async handleIncomingMessage(tenantId: string, phone: string, text: string, rawMsg: any) {
    // 2. Ambil atau buat Customer dalam ruang lingkup tenant tersebut
    let customer = await this.prisma.customer.findFirst({
      where: { tenant_id: tenantId, phone: { contains: phone }, deleted_at: null },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          tenant_id: tenantId,
          name: `WhatsApp User ${phone}`,
          phone: phone,
          status: 'LEAD',
        },
      });
      this.logger.log(`[Tenant ${tenantId}] Membuat customer baru untuk ${phone}`);
    }

    // 3. Ambil atau buat Conversation
    const conversation = await this.getOrCreateConversation(tenantId, customer.id);

    // 4. Simpan pesan masuk pelanggan di database
    const savedMessage = await this.prisma.message.create({
      data: {
        tenant_id: tenantId,
        conversation_id: conversation.id,
        sender_id: null,
        type: 'TEXT',
        content: text,
        status: 'delivered',
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        last_message: text,
        unread_count: { increment: 1 },
        updated_at: new Date(),
      },
    });

    this.emitNewMessage(tenantId, conversation.id, savedMessage);

    // 5. Periksa apakah AI Agent aktif
    const aiConfig = await this.aiService.getAgentConfig(tenantId);
    if (!aiConfig || !aiConfig.is_active) {
      this.logger.log(`[Tenant ${tenantId}] AI Agent tidak aktif. Melewati balasan otomatis.`);
      return;
    }

    // 6. Muat riwayat pesan terakhir
    const recentMessages = await this.prisma.message.findMany({
      where: { conversation_id: conversation.id, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });
    recentMessages.reverse();

    const history = recentMessages.map((m) => ({
      role: m.sender_id === null ? ('user' as const) : ('model' as const),
      content: m.content,
    }));

    if (history.length > 0) {
      history.pop();
    }

    // 7. Minta respon dari AI Service
    this.logger.log(`[Tenant ${tenantId}] Meminta jawaban AI untuk customer ${phone}...`);
    const rawAiReply = await this.aiService.generateResponse(tenantId, text, history);

    // Parse tag [GAMBAR: url] dari balasan AI
    const imageRegex = /\[GAMBAR:\s*(https?:\/\/[^\]]+)\]/i;
    const match = rawAiReply.match(imageRegex);
    
    let aiReply = rawAiReply;
    let imageUrl: string | null = null;
    
    if (match && match[1]) {
      imageUrl = match[1];
      aiReply = rawAiReply.replace(match[0], '').trim();
    }

    // 8. Kirim balasan ke nomor WhatsApp pelanggan dengan simulasi pengetikan (Anti-Ban Delay)
    const jid = rawMsg.key.remoteJid;
    const sock = this.socks.get(tenantId);
    if (sock) {
      try {
        // Kirim status "read" (centang biru)
        await sock.readMessages([rawMsg.key]);
        
        // Kirim presence update "sedang mengetik..."
        await sock.sendPresenceUpdate('composing', jid);
        
        // Hitung jeda berdasarkan panjang text (40ms per karakter, batas bawah 3s, batas atas 6s)
        const baseDelay = Math.min(Math.max(aiReply.length * 40, 3000), 6000);
        const randomDelay = baseDelay + Math.floor(Math.random() * 2000); // Variasi acak 0-2 detik
        
        this.logger.log(`[Tenant ${tenantId}] Menunggu batas aman ${randomDelay}ms (simulasi mengetik...) sebelum membalas ${phone}`);
        await new Promise((resolve) => setTimeout(resolve, randomDelay));
        
        // Hentikan status mengetik
        await sock.sendPresenceUpdate('paused', jid);
        
        // Kirim pesan balasan
        if (imageUrl) {
          try {
            await sock.sendMessage(jid, { image: { url: imageUrl }, caption: aiReply });
            this.logger.log(`[Tenant ${tenantId}] AI membalas ke ${phone} dengan lampiran foto.`);
          } catch (imgErr) {
            this.logger.error(`[Tenant ${tenantId}] Gagal mengirim lampiran foto, fallback ke link teks:`, imgErr);
            await sock.sendMessage(jid, { text: aiReply + `\n\n(Link Foto Produk: ${imageUrl})` });
          }
        } else {
          await sock.sendMessage(jid, { text: aiReply });
          this.logger.log(`[Tenant ${tenantId}] AI membalas ke ${phone}: "${aiReply}"`);
        }
      } catch (sendErr) {
        this.logger.error(`[Tenant ${tenantId}] Gagal memproses simulasi mengetik, langsung mengirim:`, sendErr);
        if (imageUrl) {
          try {
            await sock.sendMessage(jid, { image: { url: imageUrl }, caption: aiReply });
          } catch (imgErr2) {
            await sock.sendMessage(jid, { text: aiReply + `\n\n(Link Foto Produk: ${imageUrl})` });
          }
        } else {
          await sock.sendMessage(jid, { text: aiReply });
        }
      }
    } else {
      this.logger.error(`[Tenant ${tenantId}] Gagal mengirim balasan AI: Socket tidak aktif.`);
      return;
    }

    // 9. Simpan pesan balasan AI ke database (Simpan versi mentah atau versi teks bersih)
    // Di sini kita simpan aiReply (tanpa tag) agar rapi di UI Dashboard, jika ada foto kita tandai
    const finalStoredMessage = imageUrl ? `[Mengirim Foto Produk]\n${aiReply}` : aiReply;
    
    const savedAiMessage = await this.prisma.message.create({
      data: {
        tenant_id: tenantId,
        conversation_id: conversation.id,
        sender_id: 'AI_BOT',
        type: imageUrl ? 'IMAGE' : 'TEXT',
        content: finalStoredMessage,
        status: 'sent',
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        last_message: aiReply,
        updated_at: new Date(),
      },
    });

    this.emitNewMessage(tenantId, conversation.id, savedAiMessage);
  }

  private async getOrCreateConversation(tenantId: string, customerId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { tenant_id: tenantId, customer_id: customerId },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        tenant_id: tenantId,
        customer_id: customerId,
        status: 'OPEN',
      },
    });
  }

  private emitNewMessage(tenantId: string, conversationId: string, message: any) {
    if (this.chatGateway?.server) {
      this.chatGateway.server.to(`tenant:${tenantId}`).emit('message:new', {
        message,
        conversationId,
      });
    }
  }

  async connectWithPairingCode(tenantId: string = 'default', phoneNumber: string): Promise<string> {
    const currentStatus = this.statuses.get(tenantId) || 'DISCONNECTED';
    if (currentStatus === 'CONNECTED') {
      throw new Error('WhatsApp sudah terhubung.');
    }
    
    let cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanedPhone) throw new Error('Format nomor HP tidak valid');
    
    // Konversi awalan 0 menjadi 62 (Kode Negara Indonesia) untuk pairing code
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '62' + cleanedPhone.slice(1);
    }

    const currentSock = this.socks.get(tenantId);
    try {
      if (currentSock) {
        currentSock.end(undefined);
      }
    } catch {}
    
    this.socks.delete(tenantId);
    this.pairingCodes.set(tenantId, null);
    this.qrCodeUrls.set(tenantId, null);

    this.logger.log(`[Tenant ${tenantId}] Memulai socket baru untuk meminta pairing code nomor: ${cleanedPhone}`);
    await this.startWhatsapp(tenantId);

    // Tunggu 1.5 detik agar socket siap
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sock = this.socks.get(tenantId);
    if (!sock) {
      throw new Error('Gagal menginisialisasi WhatsApp socket.');
    }

    this.logger.log(`[Tenant ${tenantId}] Meminta pairing code untuk nomor: ${cleanedPhone}`);
    try {
      const code = await sock.requestPairingCode(cleanedPhone);
      this.pairingCodes.set(tenantId, code);
      this.broadcastStatus(tenantId);
      return code;
    } catch (err: any) {
      this.logger.error(`[Tenant ${tenantId}] Gagal mendapatkan pairing code:`, err);
      throw new Error(`Gagal mendapatkan pairing code: ${err.message}`);
    }
  }

  async logout(tenantId: string = 'default') {
    this.logger.log(`[Tenant ${tenantId}] Memutuskan koneksi WhatsApp & menghapus sesi...`);
    const sock = this.socks.get(tenantId);
    try {
      if (sock) {
        await sock.logout();
      }
    } catch (err) {
      // Abaikan jika socket sudah mati
    }
    this.clearSessionFolder(tenantId);
    this.statuses.set(tenantId, 'DISCONNECTED');
    this.qrCodeUrls.set(tenantId, null);
    this.connectedNumbers.set(tenantId, null);
    this.pairingCodes.set(tenantId, null);
    this.socks.delete(tenantId);
    this.broadcastStatus(tenantId);

    // Restart WA secara fresh
    this.startWhatsapp(tenantId).catch((err) => {
      this.logger.error(`[Tenant ${tenantId}] Gagal restart whatsapp setelah logout:`, err);
    });
  }

  private clearSessionFolder(tenantId: string) {
    const sessionDir = this.getSessionPath(tenantId);
    try {
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        this.logger.log(`[Tenant ${tenantId}] Sesi folder terhapus bersih.`);
      }
    } catch (err) {
      this.logger.error(`[Tenant ${tenantId}] Gagal menghapus sesi folder:`, err);
    }
  }
}

function remoteJidFromPhone(phone: string): string {
  return `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
}

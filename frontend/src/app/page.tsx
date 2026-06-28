import { redirect } from 'next/navigation';

export default function Home() {
  // Langsung arahkan ke halaman utama aplikasi UMKM (dashboard)
  redirect('/dashboard');
}

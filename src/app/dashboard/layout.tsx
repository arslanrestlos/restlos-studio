// app/dashboard/layout.tsx - SERVER COMPONENT AUTH
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔒 SERVER-SEITIGE AUTH-PRÜFUNG - Blockt ALLES ohne Login!
  const session = await getAuthSession();

  // Nicht eingeloggt → Sofort zu Login redirecten
  if (!session) {
    redirect('/login');
  }

  // Account inaktiv → Auch zu Login redirecten
  if (!session.user.isActive) {
    redirect('/login?error=ACCOUNT_DEACTIVATED');
  }

  return <DashboardClient session={session}>{children}</DashboardClient>;
}

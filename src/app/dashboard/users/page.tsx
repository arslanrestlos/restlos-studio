'use client';

import { useSession } from 'next-auth/react';
import { usePermissions } from '@/hooks/usePermissions';
import UsersList from './UsersList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { data: session, status } = useSession();
  const { isAdmin, canAccessDepartment } = usePermissions();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Lade Benutzerverwaltung...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Anmeldung erforderlich</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Sie müssen angemeldet sein, um auf die Benutzerverwaltung
              zugreifen zu können.
            </p>
            <Button asChild>
              <Link href="/login">Anmelden</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prüfe Admin-Berechtigung
  if (!isAdmin()) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Zugriff verweigert</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Sie benötigen Administrator-Berechtigungen, um auf die
              Benutzerverwaltung zugreifen zu können.
            </p>
            <p className="text-sm text-gray-500">
              Ihre aktuelle Rolle:{' '}
              <span className="font-medium capitalize">
                {session.user.role}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zum Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/support">Hilfe anfordern</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin hat Zugriff - zeige UsersList
  return <UsersList />;
}

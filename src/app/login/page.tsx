'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type ErrorState = {
  type: 'error' | 'warning' | 'success' | null;
  message: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ type: null, message: '' });

  const clearError = () => {
    setError({ type: null, message: '' });
  };

  const showError = (
    type: 'error' | 'warning' | 'success',
    message: string
  ) => {
    setError({ type, message });
  };

  const getErrorMessage = (errorCode: string) => {
    const upperError = errorCode.toUpperCase();

    switch (upperError) {
      case 'ACCOUNT_NOT_APPROVED':
        return {
          type: 'warning' as const,
          message:
            'Dein Konto ist noch nicht freigeschaltet. Bitte wende dich an den Administrator.',
        };

      case 'USER_NOT_FOUND':
        return {
          type: 'error' as const,
          message: 'Es wurde kein Konto mit dieser E-Mail-Adresse gefunden.',
        };

      case 'INVALID_PASSWORD':
        return {
          type: 'error' as const,
          message: 'Das eingegebene Passwort ist falsch.',
        };

      case 'MISSING_CREDENTIALS':
        return {
          type: 'error' as const,
          message: 'Bitte fülle alle Felder aus.',
        };

      case 'INVALID_EMAIL_FORMAT':
        return {
          type: 'error' as const,
          message: 'Bitte gib eine gültige E-Mail-Adresse ein.',
        };

      case 'ACCOUNT_LOCKED':
        return {
          type: 'error' as const,
          message:
            'Dein Konto wurde gesperrt. Bitte wende dich an den Administrator.',
        };

      case 'SERVER_ERROR':
        return {
          type: 'error' as const,
          message:
            'Ein Serverfehler ist aufgetreten. Bitte versuche es später erneut.',
        };

      default:
        if (
          upperError.includes('NOT_APPROVED') ||
          upperError.includes('FREIGESCHALTET')
        ) {
          return {
            type: 'warning' as const,
            message:
              'Dein Konto ist noch nicht freigeschaltet. Bitte wende dich an den Administrator.',
          };
        }

        if (
          upperError.includes('PASSWORT') ||
          upperError.includes('PASSWORD')
        ) {
          return {
            type: 'error' as const,
            message: 'Das eingegebene Passwort ist falsch.',
          };
        }

        if (upperError.includes('BENUTZER') || upperError.includes('USER')) {
          return {
            type: 'error' as const,
            message: 'Es wurde kein Konto mit dieser E-Mail-Adresse gefunden.',
          };
        }

        return {
          type: 'error' as const,
          message:
            'Anmeldung fehlgeschlagen. Bitte überprüfe deine Eingaben und versuche es erneut.',
        };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    clearError();

    if (!email.trim() || !password.trim()) {
      showError('error', 'Bitte fülle alle Felder aus.');
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        const errorInfo = getErrorMessage(res.error);
        showError(errorInfo.type, errorInfo.message);
      } else if (res?.ok) {
        showError(
          'success',
          'Anmeldung erfolgreich! Du wirst weitergeleitet...'
        );
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        showError(
          'error',
          'Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(
        'error',
        'Verbindung zum Server fehlgeschlagen. Bitte überprüfe deine Internetverbindung.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return '';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Anmelden</h2>
          <p className="text-gray-600">Melde dich in deinem Konto an</p>
        </div>

        {error.type && (
          <Alert
            className={`${getAlertStyles(
              error.type
            )} animate-in fade-in-0 slide-in-from-top-1 duration-300`}
          >
            {getAlertIcon(error.type)}
            <AlertDescription className="font-medium">
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-Mail-Adresse
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error.type) clearError();
              }}
              onKeyPress={handleKeyPress}
              placeholder="deine@email.de"
              className="h-11 border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Passwort
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error.type) clearError();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Dein Passwort"
              className="h-11 border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Wird angemeldet...</span>
              </div>
            ) : (
              'Anmelden'
            )}
          </Button>
        </div>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Noch kein Konto?{' '}
            <Link
              href="/register"
              className="font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
            >
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

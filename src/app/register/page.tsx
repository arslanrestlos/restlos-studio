'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Neu hinzugefügt für OTP-Weiterleitung
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
} from 'lucide-react';

type ErrorState = {
  type: 'error' | 'warning' | 'success' | null;
  message: string;
};

export default function RegisterPage() {
  const router = useRouter(); // Neu hinzugefügt für OTP-Weiterleitung

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  // Passwort-Stärke-Prüfung
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, text: '', color: '' };

    let score = 0;
    const feedback = [];

    if (pwd.length >= 8) score += 25;
    else feedback.push('min. 8 Zeichen');

    if (/[A-Z]/.test(pwd)) score += 25;
    else feedback.push('Großbuchstabe');

    if (/[a-z]/.test(pwd)) score += 25;
    else feedback.push('Kleinbuchstabe');

    if (/[0-9]/.test(pwd)) score += 25;
    else feedback.push('Zahl');

    const colors = {
      0: 'bg-gray-200',
      25: 'bg-red-400',
      50: 'bg-yellow-400',
      75: 'bg-blue-400',
      100: 'bg-green-400',
    };

    const texts = {
      0: '',
      25: 'Schwach',
      50: 'Ausreichend',
      75: 'Gut',
      100: 'Stark',
    };

    return {
      strength: score,
      text: texts[score as keyof typeof texts],
      color: colors[score as keyof typeof colors],
      feedback:
        feedback.length > 0
          ? `Fehlt: ${feedback.join(', ')}`
          : 'Alle Kriterien erfüllt',
    };
  };

  const validateForm = () => {
    // Vorname validieren
    if (!firstName.trim()) {
      showError('error', 'Bitte gib deinen Vornamen ein.');
      return false;
    }
    if (firstName.trim().length < 2) {
      showError('error', 'Der Vorname muss mindestens 2 Zeichen lang sein.');
      return false;
    }

    // Nachname validieren
    if (!lastName.trim()) {
      showError('error', 'Bitte gib deinen Nachnamen ein.');
      return false;
    }
    if (lastName.trim().length < 2) {
      showError('error', 'Der Nachname muss mindestens 2 Zeichen lang sein.');
      return false;
    }

    // E-Mail validieren
    if (!email.trim()) {
      showError('error', 'Bitte gib deine E-Mail-Adresse ein.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showError('error', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return false;
    }

    // Passwort validieren
    if (!password) {
      showError('error', 'Bitte gib ein Passwort ein.');
      return false;
    }
    if (password.length < 8) {
      showError('error', 'Das Passwort muss mindestens 8 Zeichen lang sein.');
      return false;
    }

    return true;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Strukturierte Fehlerbehandlung
        if (res.status === 409) {
          showError('warning', 'Diese E-Mail-Adresse ist bereits registriert.');
        } else if (data.error) {
          showError('error', data.error);
        } else {
          showError(
            'error',
            'Registrierung fehlgeschlagen. Bitte versuche es erneut.'
          );
        }
      } else {
        // NEU: OTP-Weiterleitung
        if (data.requiresVerification && data.email) {
          showError(
            'success',
            '🎉 Registrierung erfolgreich! Prüfe deine E-Mails für den Bestätigungscode. Du wirst weitergeleitet...'
          );

          // Formular zurücksetzen
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');

          // Zur OTP-Verifizierungsseite weiterleiten nach 3 Sekunden
          setTimeout(() => {
            router.push(`/verify?email=${encodeURIComponent(data.email)}`);
          }, 3000);
        } else {
          // Fallback für alte Registrierungen ohne OTP
          showError(
            'success',
            'Registrierung erfolgreich! Du erhältst eine Bestätigungs-E-Mail und kannst dich anmelden, sobald dein Account freigeschaltet wurde.'
          );

          // Formular zurücksetzen
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError(
        'error',
        'Verbindung zum Server fehlgeschlagen. Bitte überprüfe deine Internetverbindung.'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Registrieren</h2>
          <p className="text-gray-600">Erstelle dein neues Konto</p>
        </div>

        {/* Error/Success Alert */}
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

        {/* NEU: OTP-Info bei Success */}
        {error.type === 'success' &&
          error.message.includes('Bestätigungscode') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in-0 slide-in-from-top-1 duration-300">
              <div className="flex items-center space-x-2 text-blue-800 text-sm">
                <Mail className="h-4 w-4" />
                <span className="font-medium">
                  Nächster Schritt: E-Mail bestätigen
                </span>
              </div>
              <p className="text-blue-700 text-xs mt-1">
                Du wirst automatisch zur Bestätigungsseite weitergeleitet
              </p>
            </div>
          )}

        <div className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                Vorname *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (error.type) clearError();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Dein Vorname"
                className="h-11 bg-white border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Nachname *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (error.type) clearError();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Dein Nachname"
                className="h-11 bg-white border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-Mail-Adresse *
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
              className="h-11 bg-white border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-3">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Passwort *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error.type) clearError();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Mindestens 8 Zeichen"
                className="h-11 pr-12 bg-white border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-100 rounded-r transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Passwort-Stärke:
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.strength >= 75
                        ? 'text-green-600'
                        : passwordStrength.strength >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {passwordStrength.feedback}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Account wird erstellt...</span>
              </div>
            ) : (
              'Account erstellen'
            )}
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Bereits registriert?{' '}
            <Link
              href="/login"
              className="font-medium text-gray-900 hover:text-gray-700 hover:underline transition-colors"
            >
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowLeft,
  RefreshCw,
  Clock,
  Shield,
} from 'lucide-react';

type ErrorState = {
  type: 'error' | 'warning' | 'success' | null;
  message: string;
};

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ type: null, message: '' });
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 Minuten
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        if (prev === 13 * 60) {
          // Nach 2 Minuten Resend erlauben
          setCanResend(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect falls keine E-Mail-Parameter
  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearError = () => {
    setError({ type: null, message: '' });
  };

  const showError = (
    type: 'error' | 'warning' | 'success',
    message: string
  ) => {
    setError({ type, message });
  };

  // OTP-Input-Handler
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Nur Zahlen

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Nur letztes Zeichen
    setOtp(newOtp);

    // Auto-Focus zum nächsten Input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    clearError();
  };

  // Backspace-Handler
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  // Paste-Handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus auf nächstes leeres Feld oder letztes
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  // OTP verifizieren
  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      showError('error', 'Bitte gib alle 6 Ziffern ein.');
      return;
    }

    if (timeLeft <= 0) {
      showError(
        'error',
        'Der Code ist abgelaufen. Bitte fordere einen neuen Code an.'
      );
      return;
    }

    setLoading(true);
    clearError();

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          showError('error', data.error || 'Ungültiger Code.');
        } else if (response.status === 410) {
          showError(
            'warning',
            'Der Code ist abgelaufen. Bitte fordere einen neuen Code an.'
          );
        } else if (response.status === 404) {
          showError(
            'error',
            'Account nicht gefunden oder bereits verifiziert.'
          );
        } else {
          showError('error', data.error || 'Verifizierung fehlgeschlagen.');
        }
      } else {
        showError(
          'success',
          '🎉 E-Mail erfolgreich bestätigt! Du wirst weitergeleitet...'
        );

        // Weiterleitung nach 3 Sekunden
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      }
    } catch (error) {
      console.error('Verifizierungsfehler:', error);
      showError('error', 'Verbindung zum Server fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  // Neuen OTP anfordern
  const handleResendOtp = async () => {
    setResendLoading(true);
    clearError();

    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(
          'error',
          data.error || 'Neuer Code konnte nicht gesendet werden.'
        );
      } else {
        showError(
          'success',
          '📧 Neuer Code wurde gesendet! Prüfe deine E-Mails.'
        );
        setTimeLeft(15 * 60); // Timer zurücksetzen
        setCanResend(false); // Resend wieder deaktivieren
        setOtp(['', '', '', '', '', '']); // OTP-Felder leeren
        inputRefs.current[0]?.focus(); // Erstes Feld fokussieren
      }
    } catch (error) {
      console.error('Resend-Fehler:', error);
      showError('error', 'Verbindung zum Server fehlgeschlagen.');
    } finally {
      setResendLoading(false);
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

  if (!email) {
    return null; // Lädt oder redirected
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        {/* Back Link */}
        <Link
          href="/register"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zur Registrierung
        </Link>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-10 w-10 text-gray-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              E-Mail bestätigen
            </h2>
            <p className="text-gray-600 mt-2">
              Wir haben einen 6-stelligen Code an
            </p>
            <p className="font-medium text-gray-900 break-all text-sm bg-gray-50 px-3 py-2 rounded-lg inline-block mt-2">
              {email}
            </p>
            <p className="text-gray-600 text-sm mt-2">gesendet</p>
          </div>
        </div>

        {/* Error/Success Alert */}
        {error.type && (
          <Alert
            className={`${getAlertStyles(error.type)} animate-in fade-in-0 slide-in-from-top-1 duration-300`}
          >
            {getAlertIcon(error.type)}
            <AlertDescription className="font-medium">
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-14 text-center text-xl font-bold bg-white border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all duration-200 rounded-lg"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer & Status */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">
                  Code läuft ab in:
                  <span
                    className={`font-mono font-bold ml-1 ${
                      timeLeft <= 60
                        ? 'text-red-600'
                        : timeLeft <= 300
                          ? 'text-yellow-600'
                          : 'text-gray-900'
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>
              {timeLeft <= 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Code abgelaufen
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            disabled={loading || otp.join('').length !== 6 || timeLeft <= 0}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Wird überprüft...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Code bestätigen</span>
              </div>
            )}
          </Button>

          {/* Resend Section */}
          <div className="text-center pt-4 border-t border-gray-100 space-y-4">
            <p className="text-sm text-gray-600">Keinen Code erhalten?</p>

            <Button
              variant="outline"
              onClick={handleResendOtp}
              disabled={resendLoading || !canResend}
              className="text-sm h-11 border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              {resendLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Wird gesendet...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Neuen Code anfordern</span>
                </div>
              )}
            </Button>

            {!canResend && timeLeft > 0 && (
              <p className="text-xs text-gray-500">
                Verfügbar in {formatTime(Math.max(0, timeLeft - 13 * 60))}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

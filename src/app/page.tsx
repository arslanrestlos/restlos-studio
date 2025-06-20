import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Hero Content */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Willkommen zu deinem
            <span className="block text-gray-700">Dashboard</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            Bitte melde dich an oder registriere dich, um fortzufahren.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 px-8 text-lg bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200 group min-w-[180px]"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Anmelden
            </Button>
          </Link>

          <Link href="/register">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group min-w-[180px]"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Registrieren
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

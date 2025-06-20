// components/dashboard/shared/ComingSoon.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Bell, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  estimatedDate?: string;
  features?: string[];
  backUrl?: string;
}

export function ComingSoon({
  title,
  description,
  icon,
  estimatedDate = 'Q3 2025',
  features = [],
  backUrl = '/dashboard',
}: ComingSoonProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Dashboard
            </Link>
          </Button>
        </div>

        {/* Main Card */}
        <Card className="text-center">
          <CardHeader className="pb-8">
            <div className="flex justify-center mb-4">
              {icon ? (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {icon}
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">
                Demnächst verfügbar
              </Badge>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-lg">
                {description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Estimated Date */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                Geplant für:{' '}
                <span className="font-medium text-foreground">
                  {estimatedDate}
                </span>
              </div>
            </div>

            {/* Features Preview */}
            {features.length > 0 && (
              <div className="text-left">
                <h4 className="font-medium mb-3">Geplante Features:</h4>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notification Button */}
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Benachrichtigen wenn verfügbar
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Wir informieren Sie, sobald dieser Bereich verfügbar ist.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Haben Sie Fragen oder Wünsche zu diesem Bereich?{' '}
            <Link
              href="/dashboard/support"
              className="text-primary hover:underline"
            >
              Kontaktieren Sie uns
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

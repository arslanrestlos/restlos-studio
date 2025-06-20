// app/dashboard/marketing/page.tsx (NEU erstellen)

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tag,
  Calendar,
  Share2,
  TrendingUp,
  Plus,
  BarChart3,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function MarketingDashboard() {
  // Mock data for testing
  const stats = [
    {
      title: 'Aktive Kampagnen',
      value: '3',
      description: '2 laufen, 1 geplant',
      icon: Tag,
      trend: '+12%',
    },
    {
      title: 'Content Pipeline',
      value: '8',
      description: 'Beiträge geplant',
      icon: Calendar,
      trend: '+5%',
    },
    {
      title: 'Social Reach',
      value: '12.5K',
      description: 'Follower gesamt',
      icon: Share2,
      trend: '+8%',
    },
    {
      title: 'Conversions',
      value: '234',
      description: 'Diesen Monat',
      icon: Target,
      trend: '+15%',
    },
  ];

  const quickActions = [
    {
      title: 'Neue Kampagne',
      description: 'Kampagne erstellen und starten',
      icon: Plus,
      href: '/dashboard/marketing/campaigns/new',
      color: 'bg-blue-500',
    },
    {
      title: 'Content planen',
      description: 'Posts für Social Media planen',
      icon: Calendar,
      href: '/dashboard/marketing/content',
      color: 'bg-green-500',
    },
    {
      title: 'Analytics ansehen',
      description: 'Performance-Berichte einsehen',
      icon: BarChart3,
      href: '/dashboard/marketing/analytics',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">
            Kampagnen, Content und Performance im Überblick
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/marketing/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/marketing/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Neue Kampagne
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{stat.description}</span>
                  <Badge variant="secondary" className="text-green-600">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
          <CardDescription>
            Häufig verwendete Marketing-Aktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-start gap-3"
                  asChild
                >
                  <Link href={action.href}>
                    <div
                      className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Aktuelle Kampagnen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Sommer Sale 2025</div>
                  <div className="text-sm text-muted-foreground">
                    Läuft bis 31.07.2025
                  </div>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Social Media Push</div>
                  <div className="text-sm text-muted-foreground">
                    Startet 01.08.2025
                  </div>
                </div>
                <Badge variant="outline">Geplant</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/marketing/campaigns">
                Alle Kampagnen ansehen
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Content Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Content Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Instagram Post</div>
                  <div className="text-sm text-muted-foreground">
                    Heute, 15:00
                  </div>
                </div>
                <Badge>Bereit</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">LinkedIn Artikel</div>
                  <div className="text-sm text-muted-foreground">
                    Morgen, 09:00
                  </div>
                </div>
                <Badge variant="outline">Geplant</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/marketing/content">
                Content-Kalender öffnen
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

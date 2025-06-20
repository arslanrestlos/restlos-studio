'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Target,
  Briefcase,
  Calendar,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  BarChart3,
  Palette,
  Camera,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    totalAudiences: 0,
    completedProjects: 0,
    monthlyRevenue: 0,
    activeClients: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Hier würdest du deine echten APIs aufrufen
      // const response = await fetch('/api/dashboard/stats');

      // Für jetzt Demo-Daten laden
      setTimeout(() => {
        setStats({
          totalUsers: 42,
          activeCampaigns: 8,
          totalAudiences: 24,
          completedProjects: 156,
          monthlyRevenue: 24500,
          activeClients: 18,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
      setLoading(false);
    }
  };

  const studioStats = [
    {
      title: 'Team Mitglieder',
      value: stats.totalUsers || '42',
      change: '+3 diesen Monat',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      href: '/dashboard/users',
    },
    {
      title: 'Aktive Kampagnen',
      value: stats.activeCampaigns || '8',
      change: '+2 diese Woche',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      href: '/dashboard/marketing',
    },
    {
      title: 'Abgeschlossene Projekte',
      value: stats.completedProjects || '156',
      change: '+12 diesen Monat',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-purple-600',
      href: '#',
    },
    {
      title: 'Aktive Kunden',
      value: stats.activeClients || '18',
      change: '+5% zum Vormonat',
      trend: 'up',
      icon: Briefcase,
      color: 'text-orange-600',
      href: '/dashboard/audiences',
    },
  ];

  const quickActions = [
    {
      label: 'Neue Kampagne',
      icon: Plus,
      variant: 'default' as const,
      href: '/dashboard/marketing',
    },
    {
      label: 'Team verwalten',
      icon: Users,
      variant: 'outline' as const,
      href: '/dashboard/users',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      variant: 'outline' as const,
      href: '/dashboard/marketing',
    },
    {
      label: 'Einstellungen',
      icon: Settings,
      variant: 'outline' as const,
      href: '/dashboard/settings',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Kampagne "Brand Launch" gestartet',
      user: 'Creative Team',
      time: 'vor 15 Minuten',
      status: 'success',
      icon: Target,
    },
    {
      id: 2,
      action: 'Neues Team-Mitglied hinzugefügt',
      user: 'HR Team',
      time: 'vor 1 Stunde',
      status: 'info',
      icon: Users,
    },
    {
      id: 3,
      action: 'Projekt "Website Redesign" abgeschlossen',
      user: 'Design Team',
      time: 'vor 2 Stunden',
      status: 'success',
      icon: CheckCircle2,
    },
    {
      id: 4,
      action: 'Client Meeting verschoben',
      user: 'Project Manager',
      time: 'vor 3 Stunden',
      status: 'warning',
      icon: Calendar,
    },
  ];

  const currentProjects = [
    {
      name: 'Brand Identity Refresh',
      client: 'Tech Startup XY',
      progress: 75,
      deadline: '2 Tage',
      status: 'on-track',
    },
    {
      name: 'Social Media Campaign',
      client: 'Fashion Brand',
      progress: 40,
      deadline: '1 Woche',
      status: 'on-track',
    },
    {
      name: 'Website Relaunch',
      client: 'Restaurant Chain',
      progress: 90,
      deadline: 'Morgen',
      status: 'urgent',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Willkommensbereich */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Willkommen zurück, {session?.user?.name || 'Team'}! 👋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hier ist dein Überblick über laufende Projekte, Team-Performance und
            Studio-Aktivitäten.
          </p>
        </CardContent>
      </Card>

      {/* Haupt-Statistiken */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {studioStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.href} key={index}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ArrowUpRight
                      className={`mr-1 h-3 w-3 ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}
                    />
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Schnellaktionen */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={index}>
                  <Button
                    variant={action.variant}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Aktuelle Projekte */}
        <Card>
          <CardHeader>
            <CardTitle>Aktuelle Projekte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentProjects.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.client}
                    </p>
                  </div>
                  <Badge
                    variant={
                      project.status === 'urgent' ? 'destructive' : 'outline'
                    }
                    className="text-xs"
                  >
                    {project.deadline}
                  </Badge>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {project.progress}% abgeschlossen
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Studio Aktivitäten */}
        <Card>
          <CardHeader>
            <CardTitle>Studio Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.status === 'success'
                          ? 'bg-green-500'
                          : activity.status === 'warning'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Studio Performance & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Studio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Projektabschluss-Rate
                </span>
                <Badge variant="outline" className="text-green-600">
                  92% diesen Monat
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Durchschnittliche Projektdauer
                </span>
                <span className="text-sm text-muted-foreground">
                  3.2 Wochen
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Satisfaction</span>
                <span className="text-sm text-muted-foreground">4.8/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Team Auslastung</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wichtige Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Alle Systeme online</p>
                  <p className="text-xs text-muted-foreground">
                    Design Tools und Kollaboration funktionieren normal
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="mt-1 h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">
                    3 Projekte nähern sich Deadline
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review und Abschluss in den nächsten 2 Tagen geplant
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="mt-1 h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Team Meeting morgen</p>
                  <p className="text-xs text-muted-foreground">
                    Wöchentliches Standup um 10:00 Uhr
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

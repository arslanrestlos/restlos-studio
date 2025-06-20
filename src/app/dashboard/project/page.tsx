// app/dashboard/project/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Images,
  Plus,
  Folder,
  Clock,
  Users,
  ArrowRight,
  Palette,
  Layout,
  Camera,
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectPage() {
  const projectTools = [
    {
      title: 'Bilder Collage',
      description: 'Erstelle 2er, 3er oder 4er Collagen per Drag & Drop',
      icon: Images,
      href: '/dashboard/project/image-collage',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'Verfügbar',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      title: 'Logo Generator',
      description: 'KI-basierte Logo-Erstellung für Kunden',
      icon: Palette,
      href: '/dashboard/project/logo-generator',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'Bald verfügbar',
      statusColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      title: 'Layout Designer',
      description: 'Responsive Layouts für Web und Print',
      icon: Layout,
      href: '/dashboard/project/layout-designer',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'In Entwicklung',
      statusColor: 'bg-gray-100 text-gray-800',
    },
    {
      title: 'Foto Editor',
      description: 'Grundlegende Bildbearbeitung und Filter',
      icon: Camera,
      href: '/dashboard/project/photo-editor',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'Geplant',
      statusColor: 'bg-gray-100 text-gray-800',
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Brand Identity - Tech Startup',
      type: 'Collage',
      lastModified: 'vor 2 Stunden',
      collaborators: 3,
    },
    {
      id: 2,
      name: 'Social Media Templates',
      type: 'Layout',
      lastModified: 'gestern',
      collaborators: 1,
    },
    {
      id: 3,
      name: 'Product Photography Collage',
      type: 'Collage',
      lastModified: 'vor 3 Tagen',
      collaborators: 2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Projekt Tools</h1>
        <p className="text-muted-foreground mt-2">
          Kreative Tools für deine Studio-Projekte
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Folder className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Aktive Projekte</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Images className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Erstellte Collagen</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Team Mitglieder</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Std. diese Woche</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {projectTools.map((tool, index) => {
              const Icon = tool.icon;
              const isAvailable = tool.status === 'Verfügbar';

              return (
                <Card
                  key={index}
                  className={`transition-all hover:shadow-lg ${
                    isAvailable ? 'cursor-pointer' : 'opacity-75'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                        <Icon className={`h-6 w-6 ${tool.color}`} />
                      </div>
                      <Badge variant="secondary" className={tool.statusColor}>
                        {tool.status}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold text-lg">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    <div className="mt-4">
                      {isAvailable ? (
                        <Link href={tool.href}>
                          <Button className="w-full">
                            Tool öffnen
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full">
                          {tool.status}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Letzte Projekte</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neues Projekt
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Images className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Type: {project.type}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {project.lastModified}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {project.collaborators}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

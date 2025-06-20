'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Users,
  Settings,
  Activity,
  Users2,
  FileText,
  Tag,
  BarChart2,
  LifeBuoy,
  Link2,
  Building2,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      label: 'Hauptbereich',
      items: [
        {
          href: '/dashboard',
          label: 'Übersicht',
          icon: Activity,
          description: 'Dashboard Übersicht',
        },
        {
          href: '/dashboard/marketing',
          label: 'Marketing-Projekte',
          icon: Tag,
          description: 'Kampagnen verwalten',
        },
        {
          href: '/dashboard/audiences',
          label: 'Zielgruppen',
          icon: Users2,
          description: 'Audience Management',
        },
        {
          href: '/dashboard/content',
          label: 'Content Management',
          icon: FileText,
          description: 'Inhalte verwalten',
        },
      ],
    },
    {
      label: 'Analytics & Berichte',
      items: [
        {
          href: '/dashboard/reports',
          label: 'Berichte',
          icon: BarChart2,
          description: 'Auswertungen ansehen',
        },
      ],
    },
    {
      label: 'Verwaltung',
      items: [
        {
          href: '/dashboard/users',
          label: 'Nutzerverwaltung',
          icon: Users,
          description: 'Benutzer verwalten',
        },
        {
          href: '/dashboard/integrations',
          label: 'Integrationen',
          icon: Link2,
          description: 'Apps verbinden',
        },
        {
          href: '/dashboard/settings',
          label: 'Einstellungen',
          icon: Settings,
          description: 'Konfiguration',
        },
      ],
    },
    {
      label: 'Support',
      items: [
        {
          href: '/dashboard/support',
          label: 'Support',
          icon: LifeBuoy,
          description: 'Hilfe erhalten',
        },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b p-6">
            <SheetTitle className="flex items-center gap-2 text-left">
              <Building2 className="h-6 w-6 text-primary" />
              Dashboard
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-6">
              {navGroups.map((group, groupIndex) => (
                <div key={group.label}>
                  {groupIndex > 0 && <Separator className="my-4" />}

                  <div className="space-y-1">
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </h4>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                          <Button
                            key={item.href}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                              'w-full justify-start gap-3 h-auto p-3',
                              isActive && 'bg-secondary/80 font-medium'
                            )}
                            onClick={onClose}
                            asChild
                          >
                            <Link href={item.href}>
                              <Icon className="h-4 w-4 shrink-0" />
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm">{item.label}</span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Version 1.0</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

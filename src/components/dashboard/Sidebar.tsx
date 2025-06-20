'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Target,
  Calculator,
  UserCheck,
  Calendar,
  Share2,
  TrendingUp,
  User,
  Shield,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  description?: string;
  permission?: string;
  adminOnly?: boolean;
  comingSoon?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { canAccessDepartment, isAdmin } = usePermissions();

  const navGroups: NavGroup[] = [
    {
      label: 'Übersicht',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: Activity,
          description: 'Hauptübersicht',
        },
      ],
    },
    {
      label: 'Restlos Studio',
      items: [
        {
          href: '/dashboard/marketing',
          label: 'Marketing',
          icon: Tag,
          description: 'Kampagnen & Content',
          permission: 'marketing',
        },
        {
          href: '/dashboard/management',
          label: 'Management',
          icon: Briefcase,
          description: 'Führung & Strategie',
          permission: 'management',
          comingSoon: true,
        },
        {
          href: '/dashboard/projects',
          label: 'Projekte',
          icon: Target,
          description: 'Projektmanagement',
          permission: 'projects',
          comingSoon: true,
        },
        {
          href: '/dashboard/accounting',
          label: 'Buchhaltung',
          icon: Calculator,
          description: 'Finanzen & Controlling',
          permission: 'accounting',
          comingSoon: true,
        },
        {
          href: '/dashboard/hr',
          label: 'Personalwesen',
          icon: UserCheck,
          description: 'Human Resources',
          permission: 'hr',
          comingSoon: true,
        },
      ],
    },
    {
      label: 'Administration',
      items: [
        {
          href: '/dashboard/users',
          label: 'Nutzerverwaltung',
          icon: Users,
          description: 'Benutzer verwalten',
          adminOnly: true,
        },
        {
          href: '/dashboard/settings',
          label: 'Einstellungen',
          icon: Settings,
          description: 'System-Konfiguration',
          adminOnly: true,
        },
      ],
    },
    {
      label: 'Support & Profile',
      items: [
        {
          href: '/dashboard/integrations',
          label: 'Integrationen',
          icon: Link2,
          description: 'Apps verbinden',
        },
        {
          href: '/dashboard/audiences',
          label: 'Legacy: Zielgruppen',
          icon: Users2,
          description: 'Wird zu Marketing migriert',
        },
        {
          href: '/dashboard/support',
          label: 'Support',
          icon: LifeBuoy,
          description: 'Hilfe erhalten',
        },
      ],
    },
  ];

  // Filter items based on permissions
  const getFilteredNavGroups = () => {
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          // Admin-only items
          if (item.adminOnly && !isAdmin()) {
            return false;
          }

          // Permission-based items
          if (item.permission && !canAccessDepartment(item.permission as any)) {
            return false;
          }

          return true;
        }),
      }))
      .filter((group) => group.items.length > 0); // Remove empty groups
  };

  const filteredNavGroups = getFilteredNavGroups();

  const NavButton = ({
    item,
    isActive,
  }: {
    item: NavItem;
    isActive: boolean;
  }) => {
    const Icon = item.icon;

    const buttonContent = (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 transition-all duration-200',
          collapsed ? 'h-10 px-2' : 'h-auto p-3',
          isActive && 'bg-secondary/80 font-medium',
          item.comingSoon && 'opacity-75'
        )}
        disabled={item.comingSoon}
        asChild={!item.comingSoon}
      >
        {item.comingSoon ? (
          <div>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <div className="flex flex-col items-start gap-0.5 flex-1">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-sm">{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    Bald
                  </Badge>
                </div>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link href={item.href}>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
            )}
          </Link>
        )}
      </Button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {item.comingSoon && (
                  <Badge variant="outline" className="text-xs">
                    Bald
                  </Badge>
                )}
              </div>
              {item.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return buttonContent;
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-r bg-card">
        {/* Logo/Brand Section */}
        <div className="flex h-16 items-center justify-between border-b px-3">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-lg">Restlos Studio</span>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-full"
            >
              <Building2 className="h-6 w-6 text-primary" />
            </Link>
          )}

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-6">
            {filteredNavGroups.map((group, groupIndex) => (
              <div key={group.label}>
                {groupIndex > 0 && <Separator className="my-4" />}

                <div className="space-y-1">
                  {!collapsed && (
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </h4>
                  )}

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <NavButton
                          key={item.href}
                          item={item}
                          isActive={isActive}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer Section */}
        <div className="border-t p-3">
          <div
            className={cn(
              'rounded-lg bg-muted/50 p-3 text-center transition-all duration-200',
              collapsed && 'p-2'
            )}
          >
            <p className="text-xs text-muted-foreground">
              {collapsed ? 'v1.0' : 'Version 1.0'}
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

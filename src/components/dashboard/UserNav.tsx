'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  User,
  LogOut,
  Settings,
  HelpCircle,
  Palette,
  Bell,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export function UserNav() {
  const { data: session } = useSession();

  const userInitials = React.useMemo(() => {
    if (session?.user?.firstName && session?.user?.lastName) {
      return `${session.user.firstName[0]}${session.user.lastName[0]}`;
    }
    if (session?.user?.firstName) {
      return session.user.firstName.slice(0, 2);
    }
    if (session?.user?.name) {
      const names = session.user.name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`
        : names[0].slice(0, 2);
    }
    return 'U';
  }, [session]);

  const userName = session?.user?.firstName || session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';

  return (
    <div className="flex items-center gap-3">
      {/* Notifications - Optional */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          3
        </Badge>
        <span className="sr-only">Benachrichtigungen</span>
      </Button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-auto p-2 hover:bg-accent/50 data-[state=open]:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session?.user?.image || ''}
                  alt="User Avatar"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden md:flex md:flex-col md:items-start md:text-left">
                <span className="text-sm font-medium leading-none">
                  {userName}
                </span>
                {userEmail && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {userEmail}
                  </span>
                )}
              </div>

              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64" sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              {userEmail && (
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => (window.location.href = '/dashboard/profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profil bearbeiten
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => (window.location.href = '/dashboard/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => (window.location.href = '/dashboard/appearance')}
            >
              <Palette className="mr-2 h-4 w-4" />
              Design & Darstellung
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => (window.location.href = '/dashboard/security')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Sicherheit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => (window.location.href = '/dashboard/support')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Hilfe & Support
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => {
              signOut({ callbackUrl: '/' });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

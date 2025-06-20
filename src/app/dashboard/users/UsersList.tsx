'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
  UserCheck,
  UserX,
  Activity,
  Settings,
  Tag,
  Briefcase,
  Target,
  Calculator,
  Eye,
  Power,
  PowerOff,
} from 'lucide-react';
import { User, UserStats } from '@/lib/types/user';
import { PERMISSION_LABELS } from '@/lib/types/permissions';
import UserCreateForm from './UserCreateForm';
import UserEditForm from './UserEditForm';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [permissionFilter, setPermissionFilter] = useState<string>('all');

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter((user) => user.approved && user.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter((user) => !user.approved || !user.isActive);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter((user) => !user.approved);
      }
    }

    // Permission filter
    if (permissionFilter !== 'all') {
      filtered = filtered.filter(
        (user) =>
          user.permissions &&
          user.permissions[permissionFilter as keyof typeof user.permissions]
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, permissionFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fehler beim Laden der Nutzer');
      }
      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      toast.error(error.message || 'Fehler beim Laden der Nutzer');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Löschen fehlgeschlagen');
      }
      toast.success('Nutzer erfolgreich gelöscht');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Löschen');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserStats = (): UserStats => {
    const totalUsers = users.length;
    const activeUsers = users.filter(
      (user) => user.approved && user.isActive
    ).length;
    const approvedUsers = users.filter((user) => user.approved).length;
    const adminUsers = users.filter((user) => user.role === 'admin').length;
    const managerUsers = users.filter((user) => user.role === 'manager').length;
    const standardUsers = users.filter((user) => user.role === 'user').length;

    return {
      totalUsers,
      activeUsers,
      approvedUsers,
      adminUsers,
      managerUsers,
      standardUsers,
    };
  };

  const stats = getUserStats();

  const getPermissionIcon = (permission: string) => {
    const icons = {
      marketing: Tag,
      management: Briefcase,
      projects: Target,
      accounting: Calculator,
      hr: UserCheck,
      admin: Shield,
    };
    return icons[permission as keyof typeof icons] || Activity;
  };

  const getActivePermissions = (user: User) => {
    if (!user.permissions) return [];
    return Object.entries(user.permissions)
      .filter(([_, value]) => value)
      .map(([key]) => key);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.approved) {
      return (
        <Badge
          variant="outline"
          className="border-orange-300 text-orange-700 bg-orange-50"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Nicht freigegeben
        </Badge>
      );
    }
    if (!user.isActive) {
      return (
        <Badge
          variant="outline"
          className="border-red-300 text-red-700 bg-red-50"
        >
          <PowerOff className="w-3 h-3 mr-1" />
          Deaktiviert
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Aktiv
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Benutzerverwaltung
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie Benutzer, Rollen und Berechtigungen im Restlos
              Studio
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-fit"
            size="lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Neuer Nutzer
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Gesamt Nutzer
                  </p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Aktive Nutzer
                  </p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Administratoren
                  </p>
                  <p className="text-2xl font-bold">{stats.adminUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Manager
                  </p>
                  <p className="text-2xl font-bold">{stats.managerUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Suche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Name oder E-Mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rolle auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Rollen</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">Standard User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="pending">Nicht freigegeben</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Berechtigung</Label>
                <Select
                  value={permissionFilter}
                  onValueChange={setPermissionFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Berechtigung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Berechtigungen</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="projects">Projekte</SelectItem>
                    <SelectItem value="accounting">Buchhaltung</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  Aktualisieren
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Benutzer ({filteredUsers.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Lade Nutzer...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Keine Nutzer gefunden</p>
                <p className="text-sm">Versuchen Sie andere Suchkriterien</p>
              </div>
            ) : (
              <div className="rounded-md border-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/50">
                      <TableHead className="font-semibold">Nutzer</TableHead>
                      <TableHead className="font-semibold">
                        Rolle & Status
                      </TableHead>
                      <TableHead className="font-semibold">
                        Berechtigungen
                      </TableHead>
                      <TableHead className="font-semibold">
                        Letzter Login
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Aktionen
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow
                        key={user._id}
                        className={`${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        } hover:bg-muted/50 transition-colors`}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role === 'admin' ? (
                                <>
                                  <Shield className="w-3 h-3 mr-1" />
                                  Administrator
                                </>
                              ) : user.role === 'manager' ? (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Manager
                                </>
                              ) : (
                                <>
                                  <Users className="w-3 h-3 mr-1" />
                                  Standard User
                                </>
                              )}
                            </Badge>
                            {getStatusBadge(user)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {getActivePermissions(user)
                              .slice(0, 3)
                              .map((permission) => {
                                const Icon = getPermissionIcon(permission);
                                return (
                                  <Tooltip key={permission}>
                                    <TooltipTrigger>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Icon className="w-3 h-3 mr-1" />
                                        {
                                          PERMISSION_LABELS[
                                            permission as keyof typeof PERMISSION_LABELS
                                          ]
                                        }
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {
                                          PERMISSION_LABELS[
                                            permission as keyof typeof PERMISSION_LABELS
                                          ]
                                        }{' '}
                                        Berechtigung
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            {getActivePermissions(user).length > 3 && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-xs">
                                    +{getActivePermissions(user).length - 3}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    {getActivePermissions(user)
                                      .slice(3)
                                      .map((permission) => (
                                        <p key={permission}>
                                          {
                                            PERMISSION_LABELS[
                                              permission as keyof typeof PERMISSION_LABELS
                                            ]
                                          }
                                        </p>
                                      ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString(
                                  'de-DE',
                                  {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  }
                                )
                              : 'Nie'}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditDialogOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Details ansehen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToDelete(user);
                                  setDeleteDialogOpen(true);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Form Dialog */}
        <UserCreateForm
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={fetchUsers}
        />

        {/* Edit Form Dialog */}
        {selectedUser && (
          <UserEditForm
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) setSelectedUser(null);
            }}
            user={selectedUser}
            onSuccess={fetchUsers}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Nutzer löschen"
          description={
            <div className="space-y-2">
              <p>
                Möchten Sie{' '}
                <span className="font-semibold text-foreground">
                  {userToDelete?.firstName} {userToDelete?.lastName}
                </span>{' '}
                wirklich löschen?
              </p>
              <p className="text-sm text-muted-foreground">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
          }
          confirmText="Löschen"
          cancelText="Abbrechen"
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </div>
    </TooltipProvider>
  );
}

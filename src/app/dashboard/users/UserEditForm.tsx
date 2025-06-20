'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  RotateCcw,
  User,
  Mail,
  Lock,
  UserCog,
  Shield,
  CheckCircle2,
  XCircle,
  Tag,
  Briefcase,
  Target,
  Calculator,
  UserCheck,
  Power,
  PowerOff,
  Settings,
  Info,
  Loader2,
  Save,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import { User as UserType, UpdateUserData } from '@/lib/types/user';
import { UserPermissions, PERMISSION_LABELS } from '@/lib/types/permissions';

interface Props {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function generateRandomPassword(length = 12) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}:"<>?|[];\',./`~';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function UserEditForm({
  user,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<UpdateUserData>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    approved: user.approved,
    isActive: user.isActive ?? true,
    permissions: user.permissions || {
      marketing: false,
      management: false,
      projects: false,
      accounting: false,
      hr: false,
      admin: false,
    },
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      approved: user.approved,
      isActive: user.isActive ?? true,
      permissions: user.permissions || {
        marketing: false,
        management: false,
        projects: false,
        accounting: false,
        hr: false,
        admin: false,
      },
      password: '',
    });
  }, [user]);

  // Wenn Admin-Rolle gewählt wird, alle Permissions automatisch aktivieren
  const handleRoleChange = (role: 'admin' | 'user' | 'manager') => {
    if (role === 'admin') {
      setFormData({
        ...formData,
        role,
        permissions: {
          marketing: true,
          management: true,
          projects: true,
          accounting: true,
          hr: true,
          admin: true,
        },
      });
    } else {
      setFormData({
        ...formData,
        role,
        permissions: {
          ...formData.permissions!,
          admin: false,
        },
      });
    }
  };

  const handlePermissionChange = (
    permission: keyof UserPermissions,
    checked: boolean
  ) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions!,
        [permission]: checked,
      },
    });
  };

  async function updateUser() {
    try {
      setLoading(true);
      const payload = { ...formData };

      // Entferne leeres Passwort aus payload
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }

      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update fehlgeschlagen');
      }

      toast.success('Nutzer erfolgreich aktualisiert');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const getPermissionIcon = (permission: keyof UserPermissions) => {
    const icons = {
      marketing: Tag,
      management: Briefcase,
      projects: Target,
      accounting: Calculator,
      hr: UserCheck,
      admin: Shield,
    };
    return icons[permission] || Settings;
  };

  const permissionDescriptions = {
    marketing:
      'Zugriff auf Marketing-Kampagnen, Content-Management und Analytics',
    management: 'Management-Dashboard und strategische Übersichten',
    projects: 'Projektmanagement und Projektübersichten',
    accounting: 'Buchhaltung, Finanzen und Controlling',
    hr: 'Personalwesen und Mitarbeiterverwaltung',
    admin: 'Vollzugriff auf alle Systemfunktionen und Benutzerverwaltung',
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

  const getStatusBadge = () => {
    if (!formData.approved) {
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
    if (!formData.isActive) {
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

  if (!open) return null;

  const modalContent = (
    <TooltipProvider>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onOpenChange(false);
          }
        }}
      >
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 relative">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 pr-12">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserCog className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">Nutzer bearbeiten</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-blue-100">
                    {user.firstName} {user.lastName} • {user.email}
                  </p>
                  {getStatusBadge()}
                  <Badge
                    className={`${getRoleColor(user.role)} border-white/20`}
                  >
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
                        <User className="w-3 h-3 mr-1" />
                        Standard User
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto space-y-8">
              {/* Personal Information & Security */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Personal Information */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <User className="w-6 h-6 text-blue-600" />
                      <span>Persönliche Daten</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="firstName"
                          className="text-base font-semibold"
                        >
                          Vorname *
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          required
                          className="h-14 text-base px-4"
                          placeholder="Vorname eingeben"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="lastName"
                          className="text-base font-semibold"
                        >
                          Nachname *
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          required
                          className="h-14 text-base px-4"
                          placeholder="Nachname eingeben"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-base font-semibold"
                      >
                        E-Mail-Adresse *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className="pl-12 h-14 text-base"
                          placeholder="E-Mail-Adresse eingeben"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-2 border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <Lock className="w-6 h-6 text-orange-600" />
                      <span>Sicherheit</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="password"
                        className="text-base font-semibold"
                      >
                        Passwort (optional ändern)
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          autoComplete="new-password"
                          className="pl-12 pr-32 h-14 text-base"
                          placeholder="Leer lassen für keine Änderung"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                password: generateRandomPassword(),
                              })
                            }
                            className="h-10 px-3 text-xs"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Generieren
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-10 px-2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {formData.password && (
                        <div className="flex items-center space-x-3 mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-700 font-medium">
                            Neues Passwort wird beim Speichern gesetzt
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Role & Permissions */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Role & Status */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <span>Rolle & Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="role" className="text-base font-semibold">
                        Rolle
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={handleRoleChange}
                      >
                        <SelectTrigger className="h-14 text-base">
                          <SelectValue placeholder="Rolle wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center space-x-3 py-2">
                              <User className="w-5 h-5" />
                              <span>Standard User</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="manager">
                            <div className="flex items-center space-x-3 py-2">
                              <UserCheck className="w-5 h-5" />
                              <span>Manager</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center space-x-3 py-2">
                              <Shield className="w-5 h-5" />
                              <span>Administrator</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Account Status
                      </Label>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {formData.approved ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                Account{' '}
                                {formData.approved
                                  ? 'freigegeben'
                                  : 'nicht freigegeben'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formData.approved
                                  ? 'Benutzer kann sich anmelden'
                                  : 'Benutzer kann sich nicht anmelden'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.approved}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, approved: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {formData.isActive ? (
                              <Power className="h-5 w-5 text-green-500" />
                            ) : (
                              <PowerOff className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                Account{' '}
                                {formData.isActive ? 'aktiv' : 'deaktiviert'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formData.isActive
                                  ? 'Account ist aktiviert und nutzbar'
                                  : 'Account ist temporär deaktiviert'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isActive: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Permissions */}
                <Card className="border-2 border-green-200">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <Settings className="w-6 h-6 text-green-600" />
                      <span>Bereichs-Berechtigungen</span>
                    </CardTitle>
                    {formData.role === 'admin' && (
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-purple-800">
                          <div className="font-medium">
                            Administrator-Berechtigung
                          </div>
                          <div className="text-xs mt-1">
                            Administratoren haben automatisch Zugriff auf alle
                            Bereiche.
                          </div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                        const permission = key as keyof UserPermissions;
                        const Icon = getPermissionIcon(permission);
                        const isChecked = formData.permissions![permission];
                        const isDisabled =
                          formData.role === 'admin' && permission !== 'admin';

                        return (
                          <div
                            key={permission}
                            className={`flex items-start space-x-4 p-4 border-2 rounded-lg transition-all ${
                              isChecked
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <Checkbox
                              id={permission}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  permission,
                                  checked as boolean
                                )
                              }
                              disabled={isDisabled || loading}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <Icon className="w-5 h-5 text-gray-600" />
                                <Label
                                  htmlFor={permission}
                                  className="text-base font-medium cursor-pointer"
                                >
                                  {label}
                                </Label>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {permissionDescriptions[permission]}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Info */}
              <Card className="border-2 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <Info className="w-6 h-6 text-gray-600" />
                    <span>Benutzer-Informationen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">
                          Erstellt am:
                        </span>
                      </div>
                      <p className="font-semibold">
                        {new Date(user.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">
                          Letzter Login:
                        </span>
                      </div>
                      <p className="font-semibold">
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
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">
                          Benutzer-ID:
                        </span>
                      </div>
                      <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {user._id}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">
                          Aktive Berechtigungen:
                        </span>
                      </div>
                      <p className="font-semibold">
                        {
                          Object.values(formData.permissions!).filter(Boolean)
                            .length
                        }{' '}
                        von {Object.keys(PERMISSION_LABELS).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-6">
            <div className="mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Letztes Update:{' '}
                {new Date(user.updatedAt).toLocaleString('de-DE')}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="px-8 h-12"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={updateUser}
                  disabled={loading}
                  className="px-8 h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Wird gespeichert...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Änderungen speichern
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}

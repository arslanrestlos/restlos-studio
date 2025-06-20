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
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
  Shield,
  UserPlus,
  Check,
  AlertCircle,
  Info,
  Tag,
  Briefcase,
  Target,
  Calculator,
  UserCheck,
  Settings,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { CreateUserData } from '@/lib/types/user';
import {
  UserPermissions,
  DEFAULT_PERMISSIONS,
  PERMISSION_LABELS,
} from '@/lib/types/permissions';

interface Props {
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

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password)) strength += 12.5;
  if (/[A-Z]/.test(password)) strength += 12.5;
  if (/[0-9]/.test(password)) strength += 12.5;
  if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
  return Math.min(100, strength);
}

function getPasswordStrengthText(strength: number): string {
  if (strength < 30) return 'Schwach';
  if (strength < 60) return 'Mittel';
  if (strength < 80) return 'Stark';
  return 'Sehr stark';
}

export default function UserCreateForm({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    password: '',
    approved: true,
    isActive: true,
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
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
  }, [open]);

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 8
    );
  };

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
          ...formData.permissions,
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
        ...formData.permissions,
        [permission]: checked,
      },
    });
  };

  async function createUser() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erstellung fehlgeschlagen');
      }

      toast.success('Nutzer erfolgreich erstellt');
      onOpenChange(false);
      onSuccess();

      // Formular zurücksetzen
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        password: '',
        approved: true,
        isActive: true,
        permissions: { ...DEFAULT_PERMISSIONS },
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      password: '',
      approved: true,
      isActive: true,
      permissions: { ...DEFAULT_PERMISSIONS },
    });
  };

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

  if (!open) return null;

  const modalContent = (
    <TooltipProvider>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 pr-12">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Neuen Nutzer erstellen</h1>
                <p className="text-blue-100 mt-2">
                  Erstellen Sie einen neuen Benutzeraccount für Restlos Studio
                  mit allen erforderlichen Berechtigungen
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto space-y-8">
              {/* Personal Information & Password */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Personal Information */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <User className="w-6 h-6 text-blue-600" />
                      <span>Persönliche Informationen</span>
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
                          placeholder="z.B. Max"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          required
                          disabled={loading}
                          className="h-14 text-base px-4"
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
                          placeholder="z.B. Mustermann"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          required
                          disabled={loading}
                          className="h-14 text-base px-4"
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
                          placeholder="max.mustermann@restlos.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          disabled={loading}
                          className="pl-12 h-14 text-base"
                        />
                      </div>
                      {formData.email &&
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              Bitte geben Sie eine gültige E-Mail-Adresse ein
                            </span>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>

                {/* Password */}
                <Card className="border-2 border-orange-200">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <Lock className="w-6 h-6 text-orange-600" />
                      <span>Zugangsdaten</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="password"
                        className="text-base font-semibold"
                      >
                        Passwort *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Sicheres Passwort eingeben"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required
                          autoComplete="new-password"
                          className="pl-12 pr-32 h-14 text-base"
                          disabled={loading}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                                disabled={loading}
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Generieren
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sicheres Passwort automatisch generieren</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-10 px-2"
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Password Strength */}
                      {formData.password && (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Passwort-Stärke:
                            </span>
                            <Badge
                              variant="outline"
                              className={`${
                                passwordStrength < 30
                                  ? 'border-red-500 text-red-700 bg-red-50'
                                  : passwordStrength < 60
                                  ? 'border-orange-500 text-orange-700 bg-orange-50'
                                  : passwordStrength < 80
                                  ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                                  : 'border-green-500 text-green-700 bg-green-50'
                              }`}
                            >
                              {getPasswordStrengthText(passwordStrength)}
                            </Badge>
                          </div>
                          <Progress value={passwordStrength} className="h-3" />
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center space-x-2">
                              {formData.password.length >= 8 ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span>Min. 8 Zeichen</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/[A-Z]/.test(formData.password) ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span>Großbuchstaben</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/[0-9]/.test(formData.password) ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span>Zahlen</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/[^A-Za-z0-9]/.test(formData.password) ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span>Sonderzeichen</span>
                            </div>
                          </div>
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
                        Benutzerrolle
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={handleRoleChange}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full h-14 text-base">
                          <SelectValue placeholder="Rolle wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center space-x-3 py-2">
                              <User className="w-5 h-5" />
                              <div>
                                <div className="font-medium">Standard User</div>
                                <div className="text-xs text-gray-500">
                                  Grundlegende Berechtigungen
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="manager">
                            <div className="flex items-center space-x-3 py-2">
                              <UserCheck className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium">Manager</div>
                                <div className="text-xs text-gray-500">
                                  Erweiterte Berechtigungen
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center space-x-3 py-2">
                              <Shield className="w-5 h-5 text-purple-600" />
                              <div>
                                <div className="font-medium">Administrator</div>
                                <div className="text-xs text-gray-500">
                                  Vollzugriff auf alle Funktionen
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

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
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Account-Status
                      </Label>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-1">
                            <Label
                              htmlFor="approved"
                              className="text-sm font-medium"
                            >
                              Account freigegeben
                            </Label>
                            <p className="text-xs text-gray-600">
                              Bestimmt, ob der Benutzer sich anmelden kann
                            </p>
                          </div>
                          <Switch
                            id="approved"
                            checked={formData.approved}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, approved: checked })
                            }
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-1">
                            <Label
                              htmlFor="isActive"
                              className="text-sm font-medium"
                            >
                              Account aktiv
                            </Label>
                            <p className="text-xs text-gray-600">
                              Account kann temporär deaktiviert werden
                            </p>
                          </div>
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isActive: checked })
                            }
                            disabled={loading}
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
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                        const permission = key as keyof UserPermissions;
                        const Icon = getPermissionIcon(permission);
                        const isChecked = formData.permissions[permission];
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

              {/* Summary */}
              <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">
                    Zusammenfassung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <span className="text-sm text-blue-700 font-medium">
                        Name:
                      </span>
                      <p className="font-semibold text-blue-900">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-blue-700 font-medium">
                        E-Mail:
                      </span>
                      <p className="font-semibold text-blue-900">
                        {formData.email}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-blue-700 font-medium">
                        Rolle:
                      </span>
                      <Badge
                        variant={
                          formData.role === 'admin' ? 'default' : 'secondary'
                        }
                        className="text-sm"
                      >
                        {formData.role === 'admin'
                          ? 'Administrator'
                          : formData.role === 'manager'
                          ? 'Manager'
                          : 'Standard User'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-blue-700 font-medium">
                        Berechtigungen:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(formData.permissions)
                          .filter(([_, value]) => value)
                          .slice(0, 3)
                          .map(([key]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="text-xs"
                            >
                              {
                                PERMISSION_LABELS[
                                  key as keyof typeof PERMISSION_LABELS
                                ]
                              }
                            </Badge>
                          ))}
                        {Object.entries(formData.permissions).filter(
                          ([_, value]) => value
                        ).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +
                            {Object.entries(formData.permissions).filter(
                              ([_, value]) => value
                            ).length - 3}
                          </Badge>
                        )}
                      </div>
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
                * Pflichtfelder müssen ausgefüllt werden
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-8 h-12"
                >
                  Abbrechen
                </Button>

                <Button
                  onClick={createUser}
                  disabled={loading || !isFormValid()}
                  className="px-8 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Nutzer erstellen
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

'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Eye,
  EyeOff,
  User,
  Mail,
  Shield,
  Lock,
  Save,
  UserCog,
  AlertCircle,
} from 'lucide-react';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  password?: string;
  passwordConfirm?: string;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>();

  const isAdmin = session?.user?.role === 'admin';
  const watchedRole = watch('role');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Fehler beim Laden der Nutzerdaten');
        const data = await res.json();
        reset(data);
      } catch (error: any) {
        toast.error(error.message || 'Unbekannter Fehler');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [reset]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-center text-muted-foreground text-lg">
          Bitte zuerst einloggen.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (data.password && data.password !== data.passwordConfirm) {
      toast.error('Passwörter stimmen nicht überein.');
      return;
    }

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: isAdmin ? data.role : undefined,
          password: data.password || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Fehler beim Speichern');
      }
      toast.success('Einstellungen erfolgreich gespeichert');
      reset(data);
    } catch (error: any) {
      toast.error(error.message || 'Unbekannter Fehler');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${
      lastName?.charAt(0) || ''
    }`.toUpperCase();
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
          <p className="text-muted-foreground mt-2">
            Verwalte deine Kontodaten und Einstellungen
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(watch('firstName'), watch('lastName'))}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {watch('firstName')} {watch('lastName')}
                </h3>
                <p className="text-muted-foreground">{watch('email')}</p>
                <Badge
                  variant={watchedRole === 'admin' ? 'default' : 'secondary'}
                  className="w-fit"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {watchedRole === 'admin' ? 'Administrator' : 'Benutzer'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Persönliche Informationen</CardTitle>
            </div>
            <CardDescription>
              Aktualisiere deine grundlegenden Kontoinformationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Vorname */}
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  {...register('firstName', {
                    required: 'Vorname ist Pflichtfeld',
                  })}
                  disabled={loading || isSubmitting}
                  className="transition-colors"
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Nachname */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  {...register('lastName', {
                    required: 'Nachname ist Pflichtfeld',
                  })}
                  disabled={loading || isSubmitting}
                  className="transition-colors"
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* E-Mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-Mail-Adresse
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'E-Mail ist Pflichtfeld',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Ungültige E-Mail-Adresse',
                  },
                })}
                disabled={loading || isSubmitting}
                className="transition-colors"
              />
              {errors.email && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Konto & Sicherheit</CardTitle>
            </div>
            <CardDescription>
              Verwalte deine Benutzerrolle und Passwort-Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rolle */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Benutzerrolle
              </Label>
              {isAdmin ? (
                <Select
                  value={watchedRole}
                  onValueChange={(value) =>
                    setValue('role', value as 'admin' | 'user')
                  }
                  disabled={loading || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Benutzer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                  <Badge variant="secondary">
                    <User className="w-3 h-3 mr-1" />
                    {watchedRole === 'admin' ? 'Administrator' : 'Benutzer'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Rolle kann nicht geändert werden
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Passwort Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <Label className="text-base font-medium">Passwort ändern</Label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Neues Passwort */}
                <div className="space-y-2">
                  <Label htmlFor="password">Neues Passwort</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leer lassen, wenn keine Änderung"
                      {...register('password', {
                        minLength: {
                          value: 6,
                          message:
                            'Passwort muss mindestens 6 Zeichen lang sein',
                        },
                      })}
                      disabled={loading || isSubmitting}
                      className="pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Passwort bestätigen */}
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                  <div className="relative">
                    <Input
                      id="passwordConfirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      placeholder="Passwort wiederholen"
                      {...register('passwordConfirm')}
                      disabled={loading || isSubmitting}
                      className="pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswordConfirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="text-sm text-muted-foreground">
              {isDirty ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Ungespeicherte Änderungen
                </span>
              ) : (
                'Alle Änderungen gespeichert'
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || isSubmitting || !isDirty}
              className="w-full sm:w-auto min-w-[120px]"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Speichert...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

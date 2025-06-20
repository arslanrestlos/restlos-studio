// app/dashboard/marketing/NewCampaignForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  Euro,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Campaign {
  _id: string;
  auctionNumber: string;
  auctionLink: string;
  endDate: string;
  estimatedRevenue: number;
  budget: number;
  channels: string[];
  metaAdTypes?: string[];
  googleAdTypes?: string[];
  status: string;
  notes?: string;
}

interface NewCampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editCampaign?: Campaign | null;
}

type FormData = {
  auctionNumber: string;
  auctionLink: string;
  endDate: string;
  estimatedRevenue: string;
  budget: string;
  channels: string[];
  metaAdTypes: string[];
  googleAdTypes: string[];
  notes: string;
};

type ErrorState = {
  type: 'error' | 'success' | null;
  message: string;
};

export default function NewCampaignForm({
  open,
  onOpenChange,
  onSuccess,
  editCampaign,
}: NewCampaignFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({ type: null, message: '' });
  const [formData, setFormData] = useState<FormData>({
    auctionNumber: '',
    auctionLink: '',
    endDate: '',
    estimatedRevenue: '',
    budget: '',
    channels: [],
    metaAdTypes: [],
    googleAdTypes: [],
    notes: '',
  });

  const channels = [
    {
      id: 'meta',
      label: 'Facebook/Instagram',
      description: 'Meta Ads für Social Media Marketing',
    },
    {
      id: 'google',
      label: 'Google Ads',
      description: 'Google Suchnetzwerk und Display',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      description: 'Business-orientierte Zielgruppe',
    },
    {
      id: 'newsletter',
      label: 'Newsletter',
      description: 'E-Mail Marketing an bestehende Kunden',
    },
  ];

  const metaAdTypes = [
    {
      id: 'single-image',
      label: 'Single Image',
      description: 'Einfaches Bild mit Text',
    },
    {
      id: 'carousel',
      label: 'Carousel',
      description: 'Mehrere Bilder zum Durchscrollen',
    },
    {
      id: 'video',
      label: 'Video',
      description: 'Video-Anzeige für höhere Engagement',
    },
    {
      id: 'collection',
      label: 'Collection',
      description: 'Produkt-Katalog Anzeige',
    },
  ];

  const googleAdTypes = [
    {
      id: 'search',
      label: 'Suchnetzwerk',
      description: 'Textanzeigen in Google Suche',
    },
    {
      id: 'display',
      label: 'Display',
      description: 'Banner auf Partner-Websites',
    },
    {
      id: 'video',
      label: 'Video (YouTube)',
      description: 'Video-Anzeigen auf YouTube',
    },
    {
      id: 'performance-max',
      label: 'Performance Max',
      description: 'Automatische Optimierung über alle Kanäle',
    },
  ];

  // Form mit Edit-Daten füllen oder leeren bei neuem Modal
  useEffect(() => {
    if (open) {
      if (editCampaign) {
        console.log('🔄 Loading edit data:', editCampaign);
        setFormData({
          auctionNumber: editCampaign.auctionNumber || '',
          auctionLink: editCampaign.auctionLink || '',
          endDate: editCampaign.endDate
            ? editCampaign.endDate.split('T')[0]
            : '',
          estimatedRevenue: editCampaign.estimatedRevenue?.toString() || '',
          budget: editCampaign.budget?.toString() || '',
          channels: editCampaign.channels || [],
          metaAdTypes: editCampaign.metaAdTypes || [],
          googleAdTypes: editCampaign.googleAdTypes || [],
          notes: editCampaign.notes || '',
        });
      } else {
        console.log('🆕 Resetting form for new campaign');
        setFormData({
          auctionNumber: '',
          auctionLink: '',
          endDate: '',
          estimatedRevenue: '',
          budget: '',
          channels: [],
          metaAdTypes: [],
          googleAdTypes: [],
          notes: '',
        });
      }
      setError({ type: null, message: '' });
    }
  }, [editCampaign, open]);

  const clearError = () => setError({ type: null, message: '' });

  const showError = (type: 'error' | 'success', message: string) => {
    setError({ type, message });
  };

  const handleChannelChange = (channelId: string, checked: boolean) => {
    setFormData((prev) => {
      const newChannels = checked
        ? [...prev.channels, channelId]
        : prev.channels.filter((c) => c !== channelId);

      // Wenn Kanal entfernt wird, auch zugehörige Anzeigentypen entfernen
      let newMetaAdTypes = prev.metaAdTypes;
      let newGoogleAdTypes = prev.googleAdTypes;

      if (!checked) {
        if (channelId === 'meta') {
          newMetaAdTypes = [];
        }
        if (channelId === 'google') {
          newGoogleAdTypes = [];
        }
      }

      return {
        ...prev,
        channels: newChannels,
        metaAdTypes: newMetaAdTypes,
        googleAdTypes: newGoogleAdTypes,
      };
    });
    clearError();
  };

  const handleMetaAdTypeChange = (typeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      metaAdTypes: checked
        ? [...prev.metaAdTypes, typeId]
        : prev.metaAdTypes.filter((t) => t !== typeId),
    }));
    clearError();
  };

  const handleGoogleAdTypeChange = (typeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      googleAdTypes: checked
        ? [...prev.googleAdTypes, typeId]
        : prev.googleAdTypes.filter((t) => t !== typeId),
    }));
    clearError();
  };

  const validateForm = () => {
    if (!formData.auctionNumber.trim()) {
      showError('error', 'Bitte gib eine Auktionsnummer ein.');
      return false;
    }

    if (!formData.auctionLink.trim()) {
      showError('error', 'Bitte gib den Auktionslink ein.');
      return false;
    }

    if (!formData.endDate) {
      showError('error', 'Bitte wähle ein Enddatum aus.');
      return false;
    }

    if (
      !formData.estimatedRevenue ||
      parseFloat(formData.estimatedRevenue) <= 0
    ) {
      showError('error', 'Bitte gib eine gültige Umsatzeinschätzung ein.');
      return false;
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      showError('error', 'Bitte gib ein gültiges Budget ein.');
      return false;
    }

    if (formData.channels.length === 0) {
      showError('error', 'Bitte wähle mindestens einen Werbekanal aus.');
      return false;
    }

    if (
      formData.channels.includes('meta') &&
      formData.metaAdTypes.length === 0
    ) {
      showError(
        'error',
        'Bitte wähle mindestens einen Anzeigentyp für Facebook/Instagram.'
      );
      return false;
    }

    if (
      formData.channels.includes('google') &&
      formData.googleAdTypes.length === 0
    ) {
      showError(
        'error',
        'Bitte wähle mindestens einen Anzeigentyp für Google Ads.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit start - Edit mode:', !!editCampaign);
    clearError();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = editCampaign
        ? `/api/campaigns/${editCampaign._id}`
        : '/api/campaigns';
      const method = editCampaign ? 'PUT' : 'POST';

      const requestData = {
        auctionNumber: formData.auctionNumber.trim(),
        auctionLink: formData.auctionLink.trim(),
        endDate: formData.endDate,
        estimatedRevenue: parseFloat(formData.estimatedRevenue),
        budget: parseFloat(formData.budget),
        channels: formData.channels,
        metaAdTypes:
          formData.metaAdTypes.length > 0 ? formData.metaAdTypes : undefined,
        googleAdTypes:
          formData.googleAdTypes.length > 0
            ? formData.googleAdTypes
            : undefined,
        notes: formData.notes.trim() || undefined,
      };

      console.log(`📤 ${method} ${url}`, requestData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Fehler beim ${
              editCampaign ? 'Bearbeiten' : 'Erstellen'
            } der Kampagne`
        );
      }

      showError(
        'success',
        `Kampagne erfolgreich ${editCampaign ? 'bearbeitet' : 'erstellt'}!`
      );

      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('Campaign operation error:', error);
      showError(
        'error',
        error.message ||
          `Fehler beim ${
            editCampaign ? 'Bearbeiten' : 'Erstellen'
          } der Kampagne. Bitte versuche es erneut.`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('de-DE').format(num);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editCampaign
                  ? 'Kampagne bearbeiten'
                  : 'Neue Marketing-Kampagne'}
              </h2>
              <p className="text-gray-600">
                {editCampaign
                  ? 'Bearbeite deine bestehende Kampagne'
                  : 'Erstelle eine neue Kampagne für deine Auktion'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Error/Success Alert */}
          {error.type && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                error.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-green-200 bg-green-50 text-green-800'
              }`}
            >
              {error.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              <span className="font-medium">{error.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Auktions-Details */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Auktions-Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="auctionNumber"
                        className="text-sm font-medium text-gray-700"
                      >
                        Auktionsnummer *
                      </Label>
                      <Input
                        id="auctionNumber"
                        placeholder="z.B. 1370"
                        value={formData.auctionNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            auctionNumber: e.target.value,
                          })
                        }
                        disabled={loading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="endDate"
                        className="text-sm font-medium text-gray-700"
                      >
                        Enddatum *
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        disabled={loading}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="auctionLink"
                      className="text-sm font-medium text-gray-700"
                    >
                      Auktionslink *
                    </Label>
                    <Input
                      id="auctionLink"
                      type="url"
                      placeholder="https://..."
                      value={formData.auctionLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          auctionLink: e.target.value,
                        })
                      }
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Umsatz */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Euro className="h-5 w-5 text-green-600" />
                  Budget & Umsatzplanung
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="estimatedRevenue"
                      className="text-sm font-medium text-gray-700"
                    >
                      Geschätzte Einnahmen (€) *
                    </Label>
                    <Input
                      id="estimatedRevenue"
                      type="number"
                      placeholder="50000"
                      value={formData.estimatedRevenue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedRevenue: e.target.value,
                        })
                      }
                      disabled={loading}
                      className="h-11"
                    />
                    {formData.estimatedRevenue && (
                      <p className="text-sm text-gray-500">
                        {formatCurrency(formData.estimatedRevenue)} €
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="budget"
                      className="text-sm font-medium text-gray-700"
                    >
                      Werbebudget (€) *
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="2500"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      disabled={loading}
                      className="h-11"
                    />
                    {formData.budget && formData.estimatedRevenue && (
                      <p className="text-sm text-gray-500">
                        ROI:{' '}
                        {Math.round(
                          (parseFloat(formData.estimatedRevenue) /
                            parseFloat(formData.budget)) *
                            100
                        ) / 100}
                        x
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Werbekanäle */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Werbekanäle *
                </h3>

                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <Checkbox
                        id={channel.id}
                        checked={formData.channels.includes(channel.id)}
                        onCheckedChange={(checked) =>
                          handleChannelChange(channel.id, checked as boolean)
                        }
                        disabled={loading}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={channel.id}
                          className="font-medium cursor-pointer text-gray-900"
                        >
                          {channel.label}
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Anzeigentypen */}
              {formData.channels.includes('meta') && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Facebook/Instagram Anzeigentypen * (Mehrfachauswahl)
                  </h3>
                  <div className="space-y-3">
                    {metaAdTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <Checkbox
                          id={`meta-${type.id}`}
                          checked={formData.metaAdTypes.includes(type.id)}
                          onCheckedChange={(checked) =>
                            handleMetaAdTypeChange(type.id, checked as boolean)
                          }
                          disabled={loading}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`meta-${type.id}`}
                            className="font-medium cursor-pointer text-gray-900"
                          >
                            {type.label}
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Anzeigentypen */}
              {formData.channels.includes('google') && (
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Google Ads Anzeigentypen * (Mehrfachauswahl)
                  </h3>
                  <div className="space-y-3">
                    {googleAdTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <Checkbox
                          id={`google-${type.id}`}
                          checked={formData.googleAdTypes.includes(type.id)}
                          onCheckedChange={(checked) =>
                            handleGoogleAdTypeChange(
                              type.id,
                              checked as boolean
                            )
                          }
                          disabled={loading}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`google-${type.id}`}
                            className="font-medium cursor-pointer text-gray-900"
                          >
                            {type.label}
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notizen - Full Width */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Zusätzliche Notizen
            </h3>
            <Textarea
              placeholder="Weitere Details zur Kampagne..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
              rows={4}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-6"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 bg-gray-900 hover:bg-gray-800"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Wird {editCampaign ? 'bearbeitet' : 'erstellt'}...</span>
              </div>
            ) : (
              `Kampagne ${editCampaign ? 'bearbeiten' : 'erstellen'}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

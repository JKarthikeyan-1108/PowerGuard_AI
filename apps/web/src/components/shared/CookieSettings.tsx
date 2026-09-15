'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Lock,
  BarChart3,
  Gauge,
  Megaphone,
  Cookie,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CookiePreferences, getStoredPreferences } from './CookieConsent';

// ─────────────────────────────────────────────────────────
// Cookie Category Definitions
// ─────────────────────────────────────────────────────────

interface CookieCategory {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  icon: React.ElementType;
  essential: boolean;
  cookies: {
    name: string;
    purpose: string;
    duration: string;
  }[];
}

const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential',
    description: 'Required for authentication, security, and session management. These cookies cannot be disabled as they are necessary for the platform to function.',
    icon: Shield,
    essential: true,
    cookies: [
      {
        name: 'access_token',
        purpose: 'JWT authentication token for secure API access',
        duration: '15 minutes',
      },
      {
        name: 'refresh_token',
        purpose: 'Token for refreshing expired access tokens',
        duration: '7 days',
      },
      {
        name: 'csrf_token',
        purpose: 'Cross-site request forgery protection',
        duration: '24 hours',
      },
      {
        name: 'powerguard-cookie-consent',
        purpose: 'Stores your cookie consent preferences',
        duration: 'Persistent',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how you use the platform, which pages are most popular, and how you navigate. All data is anonymized.',
    icon: BarChart3,
    essential: false,
    cookies: [
      {
        name: '_ga',
        purpose: 'Google Analytics — distinguishes unique users',
        duration: '2 years',
      },
      {
        name: '_ga_*',
        purpose: 'Google Analytics — maintains session state',
        duration: '2 years',
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Allow us to monitor platform performance, detect errors, and optimize load times for a better experience.',
    icon: Gauge,
    essential: false,
    cookies: [
      {
        name: '_perf_timing',
        purpose: 'Measures page load and rendering performance',
        duration: 'Session',
      },
      {
        name: '_error_tracking',
        purpose: 'Captures error reports for debugging',
        duration: '30 days',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Third-Party',
    description: 'Used for marketing campaigns and third-party integrations. We do not sell your data.',
    icon: Megaphone,
    essential: false,
    cookies: [
      {
        name: '_fbp',
        purpose: 'Facebook Pixel — marketing attribution',
        duration: '90 days',
      },
      {
        name: '_gcl_au',
        purpose: 'Google Ads conversion tracking',
        duration: '90 days',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Cookie Settings Dialog Component
// ─────────────────────────────────────────────────────────

interface CookieSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preferences: CookiePreferences) => void;
}

export function CookieSettings({ open, onOpenChange, onSave }: CookieSettingsProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(getStoredPreferences);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Reset preferences when dialog opens
  useEffect(() => {
    if (open) {
      setPreferences(getStoredPreferences());
      setExpandedCategory(null);
    }
  }, [open]);

  const handleToggle = (id: keyof CookiePreferences) => {
    if (id === 'essential') return; // Cannot disable essential cookies
    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      performance: true,
      marketing: true,
    };
    onSave(allAccepted);
  };

  const handleRejectOptional = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      performance: false,
      marketing: false,
    };
    onSave(essentialOnly);
  };

  const handleSavePreferences = () => {
    onSave({ ...preferences, essential: true });
  };

  const toggleExpand = (id: string) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Cookie className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Cookie Settings</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Manage your cookie preferences below
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-1 mt-2">
          {COOKIE_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;
            const isEnabled = preferences[category.id];

            return (
              <div key={category.id}>
                {index > 0 && <Separator className="my-1" />}

                <div className="rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
                  {/* Category header */}
                  <div className="flex items-center justify-between p-3">
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        category.essential
                          ? 'bg-green-500/10 border border-green-500/20'
                          : isEnabled
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-muted border border-border'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          category.essential
                            ? 'text-green-400'
                            : isEnabled
                              ? 'text-primary'
                              : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          {category.essential && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400 border border-green-500/20">
                              <Lock className="h-2.5 w-2.5" />
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {category.cookies.length} cookie{category.cookies.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    <div className="ml-3">
                      {category.essential ? (
                        <div className="flex items-center gap-1.5 text-xs text-green-400">
                          <Check className="h-3.5 w-3.5" />
                          <span>Always on</span>
                        </div>
                      ) : (
                        <Switch
                          id={`cookie-${category.id}`}
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(category.id)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border/50 px-3 py-2.5 bg-background/50">
                      <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="space-y-1.5">
                        {category.cookies.map((cookie) => (
                          <div
                            key={cookie.name}
                            className="flex items-start justify-between rounded-md bg-muted/50 px-2.5 py-2 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <code className="font-mono text-[11px] text-primary/80">{cookie.name}</code>
                              <p className="text-muted-foreground mt-0.5">{cookie.purpose}</p>
                            </div>
                            <span className="ml-3 shrink-0 text-muted-foreground/70 text-[10px]">
                              {cookie.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRejectOptional}
            className="w-full sm:w-auto"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Reject Optional
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Accept All
          </Button>
          <Button
            variant="premium"
            size="sm"
            onClick={handleSavePreferences}
            className="w-full sm:w-auto"
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CookieSettings } from './CookieSettings';

// ─────────────────────────────────────────────────────────
// Cookie Consent Types & Storage
// ─────────────────────────────────────────────────────────

export interface CookiePreferences {
  essential: true; // Always true — non-optional
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
}

const CONSENT_STORAGE_KEY = 'powerguard-cookie-consent';
const PREFERENCES_STORAGE_KEY = 'powerguard-cookie-preferences';

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  performance: false,
  marketing: false,
};

export function getStoredConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
}

export function getStoredPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed, essential: true };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_PREFERENCES;
}

export function saveConsent(preferences: CookiePreferences): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

// ─────────────────────────────────────────────────────────
// Cookie Consent Banner Component
// ─────────────────────────────────────────────────────────

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Show banner if consent hasn't been given yet
    const hasConsent = getStoredConsent();
    if (!hasConsent) {
      // Small delay for better UX — don't flash the banner on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      performance: true,
      marketing: true,
    };
    saveConsent(prefs);
    setIsVisible(false);
  }, []);

  const handleRejectOptional = useCallback(() => {
    saveConsent(DEFAULT_PREFERENCES);
    setIsVisible(false);
  }, []);

  const handleSavePreferences = useCallback((prefs: CookiePreferences) => {
    saveConsent(prefs);
    setIsVisible(false);
    setShowSettings(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isVisible && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
          >
            <div className="mx-auto max-w-4xl">
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20">
                {/* Subtle gradient accent */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Cookie className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Cookie className="h-4 w-4 text-primary sm:hidden" />
                        <h3 className="text-sm font-semibold text-foreground">Cookie Preferences</h3>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        We use <strong>essential cookies</strong> for authentication, security, and session management.
                        Optional cookies help us improve analytics and performance.
                        Your authentication cookies are <strong>always protected</strong> with HttpOnly and Secure flags.
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/70">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-green-400 border border-green-500/20">
                          <Shield className="h-3 w-3" /> Secure
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400 border border-blue-500/20">
                          <Shield className="h-3 w-3" /> HttpOnly
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>Authentication cookies are essential and cannot be disabled</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="order-3 sm:order-1 text-muted-foreground hover:text-foreground"
                    >
                      <Settings className="h-3.5 w-3.5 mr-1.5" />
                      Manage Preferences
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRejectOptional}
                      className="order-2"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Reject Optional
                    </Button>

                    <Button
                      variant="premium"
                      size="sm"
                      onClick={handleAcceptAll}
                      className="order-1 sm:order-3"
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Accept All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <CookieSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={handleSavePreferences}
      />
    </>
  );
}

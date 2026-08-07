'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterMeterPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          setScanResult(decodedText);
          setIsScanning(false);
          scanner?.clear();
          toast.success("QR Code scanned successfully!");
        },
        (error) => {
          // Ignore scanning errors as they fire continuously when no QR is present
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const handleRegister = () => {
    if (!scanResult) return;
    toast.success(`Meter ${scanResult} registered successfully!`);
    // In a real app, send scanResult to API
    setScanResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Register New Meter</h1>
        <p className="text-muted-foreground mt-1">
          Scan the QR code on the hardware meter to securely pair it to the grid.
        </p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Scanner
          </CardTitle>
          <CardDescription>
            Point your device camera at the meter's QR label.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          
          {isScanning ? (
            <div className="w-full max-w-sm rounded-lg overflow-hidden bg-black/50 border border-border">
              <div id="qr-reader" className="w-full"></div>
            </div>
          ) : (
            <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-slate-800">
              {scanResult ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
                  <p className="text-lg font-bold text-slate-200">Scanned Successfully</p>
                  <p className="text-sm text-muted-foreground mt-2 font-mono bg-slate-950 px-3 py-1 rounded">
                    {scanResult}
                  </p>
                </>
              ) : (
                <>
                  <Camera className="h-12 w-12 text-slate-600 mb-4" />
                  <p className="text-muted-foreground">Camera is inactive</p>
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            {!isScanning && (
              <Button onClick={startScanner} className="w-full flex-1 gap-2" variant={scanResult ? "outline" : "default"}>
                <Camera className="h-4 w-4" />
                {scanResult ? "Scan Again" : "Start Camera"}
              </Button>
            )}
            {scanResult && (
              <Button onClick={handleRegister} className="w-full flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Zap className="h-4 w-4" />
                Register Meter
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
      
      {/* Offline capability indicator for PWA */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        Offline registration is enabled. Scans will sync automatically when connected.
      </div>
    </div>
  );
}

import React from 'react';
import { Zap, Shield, Activity, BarChart3 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel (Server Component) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-electric-900 via-electric-800 to-electric-700">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Floating glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-energy-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">PowerGuard</span>
          </div>

          {/* Features */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight">
                Intelligent Energy<br />
                <span className="text-energy-400">Theft Detection</span>
              </h1>
              <p className="mt-4 text-lg text-white/60 max-w-md">
                AI-powered platform for real-time electricity monitoring, anomaly detection, and predictive analytics.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Shield, label: 'AI Theft Detection', desc: '99.2% accuracy' },
                { icon: Activity, label: 'Real-time Monitoring', desc: 'Live meter data' },
                { icon: BarChart3, label: 'Predictive Analytics', desc: 'ML forecasting' },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${0.4 + i * 0.1}s`, animationFillMode: 'both' }}
                >
                  <feature.icon className="h-5 w-5 text-energy-400 mb-2" />
                  <p className="text-sm font-semibold text-white">{feature.label}</p>
                  <p className="text-xs text-white/50 mt-0.5">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/30">© {new Date().getFullYear()} PowerGuard. Enterprise Energy Intelligence.</p>
        </div>
      </div>

      {/* Right — Content area for pages */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-background">
        {children}
      </div>
    </div>
  );
}

import React from 'react';
import Image from 'next/image';
import { Activity, Shield, Receipt } from 'lucide-react';

const features = [
  {
    icon: Activity,
    label: 'Real-time Monitoring',
    desc: 'Live tracking of energy usage',
    color: 'from-[#2F75B5] to-[#00BFFF]',
    iconBg: 'bg-[#2F75B5]/20',
    iconColor: 'text-[#00BFFF]',
  },
  {
    icon: Shield,
    label: 'Theft Detection',
    desc: 'AI models detect abnormal usage',
    color: 'from-[#20C997] to-[#10b981]',
    iconBg: 'bg-[#20C997]/20',
    iconColor: 'text-[#20C997]',
  },
  {
    icon: Receipt,
    label: 'Bill Prediction',
    desc: 'Accurate future bill estimation',
    color: 'from-[#0F4C81] to-[#2F75B5]',
    iconBg: 'bg-[#2F75B5]/20',
    iconColor: 'text-[#2F75B5]',
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left — Branding Panel */}
      <div
        className="hidden lg:flex lg:w-[50%] xl:w-[48%] relative overflow-hidden flex-col justify-between"
        style={{ backgroundColor: '#061A33' }}
      >
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Soft ambient glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#2F75B5]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-10 w-64 h-64 bg-[#20C997]/8 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 pt-10 pb-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F75B5] to-[#00BFFF] shadow-lg shadow-[#2F75B5]/30">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Volt
                <span className="bg-gradient-to-r from-[#2F75B5] to-[#20C997] bg-clip-text text-transparent">
                  Guard
                </span>
              </span>
              <p className="text-xs text-[#20C997] font-medium tracking-wide mt-0.5">
                Smart Energy. Secure Future.
              </p>
            </div>
          </div>

          {/* Main heading */}
          <div className="mb-8">
            <h1 className="text-[2rem] xl:text-[2.25rem] font-bold text-white leading-tight tracking-tight">
              AI-Powered Electricity
              <br />
              Monitoring & Theft Detection
            </h1>
            <p className="mt-4 text-[15px] text-white/50 leading-relaxed max-w-md">
              Real-time energy monitoring, intelligent analytics, and automated
              alerts for a smarter and safer power ecosystem.
            </p>
          </div>

          {/* Feature blocks */}
          <div className="space-y-3 mb-auto">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-4 group"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.iconBg} transition-all duration-300`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {feature.label}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* IoT Illustration */}
          <div className="mt-6 -mx-4 xl:-mx-6">
            <div className="relative w-full h-[200px] xl:h-[240px]">
              <Image
                src="/iot-illustration.jpg"
                alt="VoltGuard IoT System - ESP32, PZEM-004T, CT Sensor, Cloud Dashboard"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-white/25 mt-6">
            © {new Date().getFullYear()} VoltGuard. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — Content area */}
      <div className="flex w-full lg:w-[50%] xl:w-[52%] items-center justify-center p-6 sm:p-10 lg:p-12 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}

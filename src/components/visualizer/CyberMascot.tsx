import React, { useState, useEffect } from 'react';
import { AgentId, AgentStatus } from '../../types/agent';

interface CyberMascotProps {
  id: AgentId;
  status: AgentStatus;
  isListening?: boolean;
  isRepairing?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CyberMascot: React.FC<CyberMascotProps> = ({
  id,
  status,
  isListening = false,
  isRepairing = false,
  size = 'md',
}) => {
  const [blink, setBlink] = useState(false);
  const [lookAngle, setLookAngle] = useState({ x: 0, y: 0 });

  // Natural blinking behavior
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Natural scanning / glancing behavior
  useEffect(() => {
    const lookInterval = setInterval(() => {
      if (status === 'active') {
        setLookAngle({
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 6,
        });
      } else {
        setLookAngle({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 3,
        });
      }
    }, 2400);

    return () => clearInterval(lookInterval);
  }, [status]);

  const scaleMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
  };

  // Agent Specific Renderers
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${scaleMap[size]} transition-transform duration-300`}
    >
      {/* Ambient glowing aura based on state */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 opacity-60 ${
          status === 'error' || isRepairing
            ? 'bg-rose-500/50 scale-125 animate-pulse'
            : status === 'active'
            ? id === 'clarifier'
              ? 'bg-cyan-400/50 scale-125 animate-pulse'
              : id === 'architect'
              ? 'bg-indigo-500/50 scale-125 animate-pulse'
              : id === 'worker'
              ? 'bg-amber-500/50 scale-125 animate-pulse'
              : 'bg-emerald-500/50 scale-125 animate-pulse'
            : status === 'success'
            ? 'bg-emerald-400/40 scale-110'
            : 'bg-slate-700/20 scale-90'
        }`}
      />

      {/* SVG Canvas for Character Avatar */}
      <svg
        viewBox="0 0 160 160"
        className={`relative z-10 w-full h-full drop-shadow-2xl overflow-visible transition-transform duration-300 ${
          status === 'active' ? 'animate-[bounce_2s_infinite]' : 'hover:scale-105'
        }`}
      >
        <defs>
          {/* Clarifier Gradients */}
          <linearGradient id="clarifierBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="50%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="cyanHolo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>

          {/* Architect Gradients */}
          <linearGradient id="architectBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="neonBlueprint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
          </linearGradient>

          {/* Worker Gradients */}
          <linearGradient id="workerBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="hardHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Auditor Gradients */}
          <linearGradient id="auditorBodyNormal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="auditorBodyAlert" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c0519" />
            <stop offset="50%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          {/* Circuit Glow Filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ---------------- AGENTE 1: EL CLARIFICADOR ---------------- */}
        {id === 'clarifier' && (
          <g className="mascot-clarifier">
            {/* Robot Hover Antenna / Halo */}
            <circle
              cx="80"
              cy="25"
              r={isListening ? '9' : '6'}
              fill="#22d3ee"
              filter="url(#neonGlow)"
              className={isListening ? 'animate-ping' : ''}
            />
            <line x1="80" y1="28" x2="80" y2="42" stroke="#22d3ee" strokeWidth="2.5" />

            {/* Floating Cyber Head/Chassis */}
            <rect
              x="42"
              y="42"
              width="76"
              height="68"
              rx="22"
              fill="url(#clarifierBody)"
              stroke="#22d3ee"
              strokeWidth="2.5"
            />

            {/* Ear Comms / Acoustic Sensors */}
            <rect x="34" y="60" width="8" height="28" rx="4" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
            <rect x="118" y="60" width="8" height="28" rx="4" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
            {isListening && (
              <>
                <circle cx="28" cy="74" r="6" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.8" className="animate-ping" />
                <circle cx="132" cy="74" r="6" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.8" className="animate-ping" />
              </>
            )}

            {/* Face Visor Glass */}
            <rect x="52" y="54" width="56" height="38" rx="12" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />

            {/* Left Eye (Expressive Cyber Eye) */}
            <g transform={`translate(${lookAngle.x}, ${lookAngle.y})`}>
              {blink ? (
                <line x1="62" y1="73" x2="74" y2="73" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
              ) : (
                <>
                  <ellipse cx="68" cy="72" rx="6" ry="7" fill="#083344" stroke="#22d3ee" strokeWidth="1.5" />
                  <circle cx="68" cy="72" r="3.5" fill="#22d3ee" />
                  <circle cx="69.5" cy="70.5" r="1.2" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Right Eye: Tactical Holographic Monocle / Magnifier */}
            <g transform={`translate(${lookAngle.x}, ${lookAngle.y})`}>
              {blink ? (
                <line x1="86" y1="73" x2="98" y2="73" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
              ) : (
                <>
                  <circle cx="92" cy="72" r="8" fill="url(#cyanHolo)" stroke="#06b6d4" strokeWidth="2" />
                  <circle cx="92" cy="72" r="4" fill="#22d3ee" />
                  <circle cx="93.5" cy="70.5" r="1.5" fill="#ffffff" />
                  {/* Monocle HUD crosshairs */}
                  <line x1="92" y1="62" x2="92" y2="65" stroke="#a5f3fc" strokeWidth="1.5" />
                  <line x1="92" y1="79" x2="92" y2="82" stroke="#a5f3fc" strokeWidth="1.5" />
                  <line x1="82" y1="72" x2="85" y2="72" stroke="#a5f3fc" strokeWidth="1.5" />
                  <line x1="99" y1="72" x2="102" y2="72" stroke="#a5f3fc" strokeWidth="1.5" />
                </>
              )}
            </g>

            {/* Tactical Monocle Reticle Bracket & Cable */}
            <path d="M 100 70 Q 112 66 118 74" fill="none" stroke="#22d3ee" strokeWidth="1.5" />

            {/* Cute Smile / Voice Waveform mouth */}
            {status === 'active' || isListening ? (
              <path d="M 68 85 Q 80 92 92 85" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
            ) : status === 'success' ? (
              <path d="M 68 84 Q 80 94 92 84" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <line x1="72" y1="86" x2="88" y2="86" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* Prop: Holographic Magnifying Lens floating in front */}
            <g
              className={`transition-transform duration-500 ${
                status === 'active' ? 'translate-x-1 -translate-y-1 scale-110' : ''
              }`}
            >
              <circle
                cx="120"
                cy="104"
                r="18"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                filter="url(#neonGlow)"
              />
              <circle cx="120" cy="104" r="14" fill="url(#cyanHolo)" opacity="0.6" />
              <line x1="133" y1="117" x2="148" y2="132" stroke="#0891b2" strokeWidth="5" strokeLinecap="round" />
              <line x1="133" y1="117" x2="148" y2="132" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
              {/* Scan beam from lens when active */}
              {status === 'active' && (
                <polygon
                  points="120,104 105,124 135,124"
                  fill="#22d3ee"
                  opacity="0.35"
                  className="animate-pulse"
                />
              )}
            </g>

            {/* Floating Mini Thrusters */}
            <ellipse cx="64" cy="115" rx="7" ry="3" fill="#0891b2" />
            <ellipse cx="96" cy="115" rx="7" ry="3" fill="#0891b2" />
            <path d="M 60 116 Q 64 125 68 116" fill="#22d3ee" opacity="0.8" />
            <path d="M 92 116 Q 96 125 100 116" fill="#22d3ee" opacity="0.8" />
          </g>
        )}

        {/* ---------------- AGENTE 2: EL ARQUITECTO ---------------- */}
        {id === 'architect' && (
          <g className="mascot-architect">
            {/* High-Tech Antenna / Geometric Crystal */}
            <polygon
              points="80,18 86,28 80,38 74,28"
              fill="#818cf8"
              filter="url(#neonGlow)"
              className={status === 'active' ? 'animate-pulse' : ''}
            />
            <line x1="80" y1="36" x2="80" y2="44" stroke="#6366f1" strokeWidth="2" />

            {/* Angular Cybernetic Head */}
            <polygon
              points="45,46 115,46 125,98 80,118 35,98"
              fill="url(#architectBody)"
              stroke="#6366f1"
              strokeWidth="2.5"
            />

            {/* Geometric Visor */}
            <polygon
              points="52,56 108,56 114,84 80,96 46,84"
              fill="#0f172a"
              stroke="#818cf8"
              strokeWidth="1.5"
            />

            {/* Focused Architecture Eyes */}
            <g transform={`translate(${lookAngle.x * 0.8}, ${lookAngle.y * 0.8})`}>
              {blink ? (
                <>
                  <line x1="60" y1="72" x2="72" y2="72" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="88" y1="72" x2="100" y2="72" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Concentrated narrow eyes */}
                  <rect x="60" y="66" width="14" height="10" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
                  <rect x="86" y="66" width="14" height="10" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
                  <circle cx="67" cy="71" r="3" fill="#a5b4fc" />
                  <circle cx="93" cy="71" r="3" fill="#a5b4fc" />
                  <circle cx="68" cy="70" r="1" fill="#ffffff" />
                  <circle cx="94" cy="70" r="1" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Calculating mouth / synth grid */}
            <rect x="74" y="102" width="12" height="4" rx="2" fill="#818cf8" opacity="0.8" />

            {/* Prop 1: Floating Holographic Blueprint Grid */}
            <g
              className={`transition-transform duration-500 ${
                status === 'active' ? '-translate-y-2 scale-105' : ''
              }`}
            >
              <rect
                x="18"
                y="92"
                width="42"
                height="32"
                rx="4"
                fill="url(#neonBlueprint)"
                stroke="#60a5fa"
                strokeWidth="1.5"
                transform="rotate(-12 39 108)"
              />
              {/* Blueprint Grid Lines */}
              <line x1="22" y1="102" x2="56" y2="94" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="24" y1="110" x2="58" y2="102" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="32" y1="92" x2="38" y2="122" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="46" y1="90" x2="52" y2="120" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />
            </g>

            {/* Prop 2: Holographic T-Square Ruler + Stylus Pen */}
            <g
              className={`transition-transform duration-300 ${
                status === 'active' ? 'translate-x-1 translate-y-1' : ''
              }`}
            >
              {/* T-Square Ruler */}
              <rect x="110" y="80" width="34" height="6" rx="1.5" fill="#818cf8" stroke="#c7d2fe" strokeWidth="1" transform="rotate(35 127 83)" />
              <rect x="118" y="70" width="6" height="40" rx="1.5" fill="#6366f1" stroke="#c7d2fe" strokeWidth="1" transform="rotate(35 121 90)" />

              {/* Laser Stylus Pen */}
              <line x1="126" y1="116" x2="142" y2="94" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="126" cy="116" r="3" fill="#38bdf8" filter="url(#neonGlow)" />
              {status === 'active' && (
                <circle cx="126" cy="116" r="6" fill="#38bdf8" opacity="0.5" className="animate-ping" />
              )}
            </g>
          </g>
        )}

        {/* ---------------- AGENTE 3: EL WORKER ---------------- */}
        {id === 'worker' && (
          <g className="mascot-worker">
            {/* Industrial Safety Hard Hat */}
            <path
              d="M 40 54 Q 80 20 120 54 Z"
              fill="url(#hardHatGrad)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            {/* Hat Ridge & Hazard Lamp */}
            <path d="M 74 27 Q 80 23 86 27 L 86 54 L 74 54 Z" fill="#d97706" />
            <circle cx="80" cy="40" r="5" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" filter="url(#neonGlow)" />
            {/* Hat Brim */}
            <path d="M 32 54 L 128 54 Q 130 58 126 60 L 34 60 Q 30 58 32 54 Z" fill="#b45309" />

            {/* Industrial Chassis / Head */}
            <rect
              x="42"
              y="58"
              width="76"
              height="58"
              rx="16"
              fill="url(#workerBody)"
              stroke="#f59e0b"
              strokeWidth="2"
            />

            {/* Hazard Stripes Pattern */}
            <line x1="44" y1="62" x2="52" y2="70" stroke="#78350f" strokeWidth="2" />
            <line x1="54" y1="62" x2="62" y2="70" stroke="#78350f" strokeWidth="2" />
            <line x1="98" y1="62" x2="106" y2="70" stroke="#78350f" strokeWidth="2" />
            <line x1="108" y1="62" x2="116" y2="70" stroke="#78350f" strokeWidth="2" />

            {/* Visor Area */}
            <rect x="50" y="68" width="60" height="30" rx="8" fill="#1c1917" stroke="#ea580c" strokeWidth="1.5" />

            {/* Hardworking Eyes (Energetic & Determined) */}
            <g transform={`translate(${lookAngle.x}, ${lookAngle.y})`}>
              {blink ? (
                <>
                  <line x1="58" y1="83" x2="72" y2="83" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                  <line x1="88" y1="83" x2="102" y2="83" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="65" cy="82" r="6" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="95" cy="82" r="6" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="65" cy="82" r="3.5" fill="#fde047" />
                  <circle cx="95" cy="82" r="3.5" fill="#fde047" />
                  <circle cx="66" cy="80.5" r="1.2" fill="#ffffff" />
                  <circle cx="96" cy="80.5" r="1.2" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Determined Grin / Steam vent */}
            {status === 'active' || isRepairing ? (
              <path d="M 70 94 L 90 94" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <path d="M 68 93 Q 80 99 92 93" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* Prop: Mechanical Code Wrench & Sparks */}
            <g
              className={`transition-transform duration-200 ${
                status === 'active' || isRepairing ? 'rotate-12 translate-x-2 -translate-y-2' : ''
              }`}
            >
              {/* Heavy Duty Futuristic Wrench */}
              <line x1="116" y1="124" x2="138" y2="92" stroke="#78716c" strokeWidth="6" strokeLinecap="round" />
              <line x1="116" y1="124" x2="138" y2="92" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
              {/* Wrench Jaw */}
              <path d="M 132 86 L 144 80 L 148 94 L 140 100 Z" fill="#44403c" stroke="#f59e0b" strokeWidth="1.5" />

              {/* Dynamic Flying Sparks when Active or Repairing */}
              {(status === 'active' || isRepairing) && (
                <g className="animate-pulse">
                  <line x1="140" y1="78" x2="152" y2="68" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
                  <line x1="146" y1="90" x2="158" y2="92" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                  <line x1="136" y1="72" x2="140" y2="60" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="152" cy="74" r="2" fill="#ffffff" />
                  <circle cx="156" cy="84" r="1.5" fill="#fde047" />
                </g>
              )}
            </g>

            {/* Heavy Base Shock Dampeners */}
            <rect x="52" y="116" width="20" height="8" rx="4" fill="#78350f" />
            <rect x="88" y="116" width="20" height="8" rx="4" fill="#78350f" />
          </g>
        )}

        {/* ---------------- AGENTE 4: EL VERIFICADOR / AUDITOR ---------------- */}
        {id === 'auditor' && (
          <g className="mascot-auditor">
            {/* Top Tactical Scanner Crest */}
            <path
              d="M 64 36 L 80 20 L 96 36 Z"
              fill={status === 'error' || isRepairing ? '#f43f5e' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="1.5"
              filter="url(#neonGlow)"
            />

            {/* Armored Cyber Shield Chassis */}
            <path
              d="M 40 46 L 120 46 L 124 94 Q 80 128 36 94 Z"
              fill={status === 'error' || isRepairing ? 'url(#auditorBodyAlert)' : 'url(#auditorBodyNormal)'}
              stroke={status === 'error' || isRepairing ? '#f43f5e' : '#10b981'}
              strokeWidth="2.5"
            />

            {/* Laser Scanner Visor / Optical Bar */}
            <rect
              x="46"
              y="58"
              width="68"
              height="28"
              rx="8"
              fill="#022c22"
              stroke={status === 'error' || isRepairing ? '#fda4af' : '#6ee7b7'}
              strokeWidth="1.5"
            />

            {/* Horizontal Laser Scanning Beam Animation */}
            {status === 'active' && (
              <g className="animate-pulse">
                <line
                  x1="48"
                  y1="72"
                  x2="112"
                  y2="72"
                  stroke={isRepairing ? '#ef4444' : '#34d399'}
                  strokeWidth="3"
                  filter="url(#neonGlow)"
                />
                <circle cx="80" cy="72" r="5" fill="#ffffff" className="animate-ping" />
              </g>
            )}

            {/* Analytical Eyes (Visor Optics) */}
            <g transform={`translate(${lookAngle.x}, ${lookAngle.y})`}>
              {blink ? (
                <>
                  <line x1="56" y1="72" x2="70" y2="72" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />
                  <line x1="90" y1="72" x2="104" y2="72" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : status === 'error' || isRepairing ? (
                // Alert / Stern Eyes
                <>
                  <line x1="56" y1="67" x2="72" y2="75" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                  <line x1="104" y1="67" x2="88" y2="75" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : status === 'success' ? (
                // Happy Winking / Approved Eyes
                <>
                  <path d="M 56 74 Q 64 66 72 74" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 88 74 Q 96 66 104 74" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                // Steady scanning eyes
                <>
                  <circle cx="64" cy="72" r="6" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
                  <circle cx="96" cy="72" r="6" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
                  <circle cx="64" cy="72" r="3" fill="#6ee7b7" />
                  <circle cx="96" cy="72" r="3" fill="#6ee7b7" />
                </>
              )}
            </g>

            {/* Prop: Tactical Energy Shield & Status Checkmark / Warning Triangle */}
            <g
              className={`transition-transform duration-300 ${
                status === 'success' ? 'scale-110' : status === 'error' ? 'rotate-6' : ''
              }`}
            >
              {/* Tactical Shield Emblem on Chest */}
              <circle
                cx="80"
                cy="100"
                r="14"
                fill={status === 'error' || isRepairing ? '#881337' : '#064e3b'}
                stroke={status === 'error' || isRepairing ? '#f43f5e' : '#10b981'}
                strokeWidth="2"
              />

              {status === 'error' || isRepairing ? (
                // Hazard Warning Triangle Icon
                <g filter="url(#neonGlow)">
                  <polygon points="80,91 88,106 72,106" fill="#f43f5e" />
                  <line x1="80" y1="95" x2="80" y2="101" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="80" cy="104" r="0.8" fill="#ffffff" />
                </g>
              ) : (
                // Verified Checkmark Icon
                <path
                  d="M 74 100 L 78 104 L 86 96"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonGlow)"
                />
              )}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

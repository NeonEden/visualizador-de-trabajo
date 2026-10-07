import React from 'react';
import { AgentId } from '../../types/agent';

interface FlowWiresProps {
  activeWire: { from: AgentId; to: AgentId; isRepairLoop?: boolean } | null;
  pipelineRunning: boolean;
  agentStates: Record<AgentId, string>;
}

export const FlowWires: React.FC<FlowWiresProps> = ({
  activeWire,
  agentStates,
}) => {
  // Wire 1: Clarifier (x=12.5%) -> Architect (x=37.5%)
  // Wire 2: Architect (x=37.5%) -> Worker (x=62.5%)
  // Wire 3: Worker (x=62.5%) -> Auditor (x=87.5%)
  // Repair Loop Wire: Auditor (x=87.5%) -> Worker (x=62.5%) (curved beneath)

  const isWire1Active =
    (activeWire?.from === 'clarifier' && activeWire?.to === 'architect') ||
    agentStates.clarifier === 'active';

  const isWire2Active =
    (activeWire?.from === 'architect' && activeWire?.to === 'worker') ||
    agentStates.architect === 'active';

  const isWire3Active =
    (activeWire?.from === 'worker' && activeWire?.to === 'auditor') ||
    agentStates.worker === 'active';

  const isRepairActive =
    (activeWire?.isRepairLoop && activeWire.from === 'auditor' && activeWire.to === 'worker') ||
    (agentStates.auditor === 'error');

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          {/* Gradient Pipe 1: Cyan to Indigo */}
          <linearGradient id="pipe1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          {/* Gradient Pipe 2: Indigo to Amber */}
          <linearGradient id="pipe2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Gradient Pipe 3: Amber to Emerald */}
          <linearGradient id="pipe3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Repair Loop Gradient: Crimson to Amber */}
          <linearGradient id="repairGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="wireGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ----------------- PIPE 1: Clarifier -> Architect ----------------- */}
        {/* Background track */}
        <path
          d="M 125 110 C 180 110, 310 110, 375 110"
          stroke="#1e293b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Neon Core */}
        <path
          d="M 125 110 C 180 110, 310 110, 375 110"
          stroke="url(#pipe1)"
          strokeWidth="3"
          strokeOpacity={isWire1Active ? '1' : '0.4'}
          filter={isWire1Active ? 'url(#wireGlow)' : undefined}
          strokeDasharray={isWire1Active ? '8 6' : 'none'}
          className={isWire1Active ? 'animate-[dash_1s_linear_infinite]' : ''}
        />
        {isWire1Active && (
          <circle r="5" fill="#22d3ee" filter="url(#wireGlow)">
            <animateMotion
              path="M 125 110 C 180 110, 310 110, 375 110"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* ----------------- PIPE 2: Architect -> Worker ----------------- */}
        {/* Background track */}
        <path
          d="M 375 110 C 435 110, 565 110, 625 110"
          stroke="#1e293b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Neon Core */}
        <path
          d="M 375 110 C 435 110, 565 110, 625 110"
          stroke="url(#pipe2)"
          strokeWidth="3"
          strokeOpacity={isWire2Active ? '1' : '0.4'}
          filter={isWire2Active ? 'url(#wireGlow)' : undefined}
          strokeDasharray={isWire2Active ? '8 6' : 'none'}
          className={isWire2Active ? 'animate-[dash_1s_linear_infinite]' : ''}
        />
        {isWire2Active && (
          <circle r="5" fill="#818cf8" filter="url(#wireGlow)">
            <animateMotion
              path="M 375 110 C 435 110, 565 110, 625 110"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* ----------------- PIPE 3: Worker -> Auditor ----------------- */}
        {/* Background track */}
        <path
          d="M 625 110 C 685 110, 815 110, 875 110"
          stroke="#1e293b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Neon Core */}
        <path
          d="M 625 110 C 685 110, 815 110, 875 110"
          stroke="url(#pipe3)"
          strokeWidth="3"
          strokeOpacity={isWire3Active ? '1' : '0.4'}
          filter={isWire3Active ? 'url(#wireGlow)' : undefined}
          strokeDasharray={isWire3Active ? '8 6' : 'none'}
          className={isWire3Active ? 'animate-[dash_1s_linear_infinite]' : ''}
        />
        {isWire3Active && (
          <circle r="5" fill="#34d399" filter="url(#wireGlow)">
            <animateMotion
              path="M 625 110 C 685 110, 815 110, 875 110"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* ----------------- REPAIR LOOP: Auditor -> Worker (Curved Underneath) ----------------- */}
        {/* Background track */}
        <path
          d="M 875 130 C 860 215, 640 215, 625 130"
          stroke="#3f121b"
          strokeWidth="5"
          strokeDasharray="5 5"
          opacity={isRepairActive ? 0.9 : 0.25}
        />
        {/* Animated Repair Core */}
        <path
          d="M 875 130 C 860 215, 640 215, 625 130"
          stroke="url(#repairGrad)"
          strokeWidth={isRepairActive ? '4' : '2'}
          strokeOpacity={isRepairActive ? '1' : '0.3'}
          filter={isRepairActive ? 'url(#wireGlow)' : undefined}
          strokeDasharray={isRepairActive ? '10 6' : '4 4'}
          className={isRepairActive ? 'animate-[dash_0.8s_linear_infinite]' : ''}
        />
        {isRepairActive && (
          <>
            <circle r="6" fill="#f43f5e" filter="url(#wireGlow)">
              <animateMotion
                path="M 875 130 C 860 215, 640 215, 625 130"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Pulsing Loop Tag */}
            <g transform="translate(750, 195)">
              <rect x="-65" y="-12" width="130" height="24" rx="12" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fill="#fecdd3" fontSize="10" fontWeight="bold" fontFamily="monospace">
                REPAIR LOOP ACTIVE
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

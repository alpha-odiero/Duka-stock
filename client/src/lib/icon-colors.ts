import type { CSSProperties } from 'react';

export type IconColor =
  | 'orange'
  | 'amber'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'red'
  | 'slate';

export interface IconColorDef {
  color: string;
  hover: string;
  bg: string;
  bgHover: string;
  activeBg: string;
  wash: string;
}

export const iconColors: Record<IconColor, IconColorDef> = {
  orange: {
    color: '#F47C00',
    hover: '#D96500',
    bg: 'rgba(244,124,0,0.12)',
    bgHover: 'rgba(244,124,0,0.20)',
    activeBg: 'rgba(244,124,0,0.22)',
    wash: 'radial-gradient(closest-side, rgba(244,124,0,0.20), transparent)',
  },
  amber: {
    color: '#F59E0B',
    hover: '#D97706',
    bg: 'rgba(245,158,11,0.12)',
    bgHover: 'rgba(245,158,11,0.20)',
    activeBg: 'rgba(245,158,11,0.22)',
    wash: 'radial-gradient(closest-side, rgba(245,158,11,0.20), transparent)',
  },
  green: {
    color: '#16A34A',
    hover: '#15803D',
    bg: 'rgba(22,163,74,0.12)',
    bgHover: 'rgba(22,163,74,0.20)',
    activeBg: 'rgba(22,163,74,0.22)',
    wash: 'radial-gradient(closest-side, rgba(22,163,74,0.20), transparent)',
  },
  teal: {
    color: '#0F9D8A',
    hover: '#0D8374',
    bg: 'rgba(15,157,138,0.12)',
    bgHover: 'rgba(15,157,138,0.20)',
    activeBg: 'rgba(15,157,138,0.22)',
    wash: 'radial-gradient(closest-side, rgba(15,157,138,0.20), transparent)',
  },
  blue: {
    color: '#3B82F6',
    hover: '#2563EB',
    bg: 'rgba(59,130,246,0.12)',
    bgHover: 'rgba(59,130,246,0.20)',
    activeBg: 'rgba(59,130,246,0.22)',
    wash: 'radial-gradient(closest-side, rgba(59,130,246,0.20), transparent)',
  },
  purple: {
    color: '#8B5CF6',
    hover: '#7C3AED',
    bg: 'rgba(139,92,246,0.12)',
    bgHover: 'rgba(139,92,246,0.20)',
    activeBg: 'rgba(139,92,246,0.22)',
    wash: 'radial-gradient(closest-side, rgba(139,92,246,0.20), transparent)',
  },
  red: {
    color: '#EF4444',
    hover: '#DC2626',
    bg: 'rgba(239,68,68,0.12)',
    bgHover: 'rgba(239,68,68,0.20)',
    activeBg: 'rgba(239,68,68,0.22)',
    wash: 'radial-gradient(closest-side, rgba(239,68,68,0.20), transparent)',
  },
  slate: {
    color: '#64748B',
    hover: '#475569',
    bg: 'rgba(100,116,139,0.12)',
    bgHover: 'rgba(100,116,139,0.20)',
    activeBg: 'rgba(100,116,139,0.22)',
    wash: 'radial-gradient(closest-side, rgba(100,116,139,0.20), transparent)',
  },
};

export interface IconColorVars {
  '--tone-color': string;
  '--tone-hover': string;
  '--tone-bg': string;
  '--tone-bg-hover': string;
  '--tone-active-bg': string;
}

export function iconColorVars(color: IconColor, active = false): CSSProperties {
  const c = iconColors[color];
  const vars: IconColorVars =
    active === true
      ? {
          '--tone-color': c.hover,
          '--tone-hover': c.hover,
          '--tone-bg': c.activeBg,
          '--tone-bg-hover': c.bgHover,
          '--tone-active-bg': c.activeBg,
        }
      : {
          '--tone-color': c.color,
          '--tone-hover': c.hover,
          '--tone-bg': c.bg,
          '--tone-bg-hover': c.bgHover,
          '--tone-active-bg': c.activeBg,
        };
  return vars as CSSProperties;
}
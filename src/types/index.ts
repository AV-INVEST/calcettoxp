import type { Role as PrismaRole, MatchResult as PrismaMatchResult, PreferredFoot as PrismaPreferredFoot, SubscriptionStatus, Achievement } from '@prisma/client';

export const Role = {
  POR: 'POR',
  DIF: 'DIF',
  CEN: 'CEN',
  ATT: 'ATT',
} as const;

export type Role = PrismaRole;

export const MatchResult = {
  WIN: 'WIN',
  DRAW: 'DRAW',
  LOSS: 'LOSS',
} as const;

export type MatchResult = PrismaMatchResult;

export const PreferredFoot = {
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
  BOTH: 'BOTH',
} as const;

export type PreferredFoot = PrismaPreferredFoot;

export interface CardAttributes {
  form: number;
  impact: number;
  results: number;
  scoring: number;
  experience: number;
  consistency: number;
}

export interface SeasonKeyInfo {
  seasonKey: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface SubscriptionWithStatus {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnlockedAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  tier: Achievement['tier'];
  unlockedAt: Date | null;
  progress: number;
  progressTarget: number | null;
}

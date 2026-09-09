export type SubscriptionShape = {
  subscriptionStatus?: 'INACTIVE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | null;
  currentPeriodEnd?: Date | null;
};

export function hasActivePro(sub?: SubscriptionShape): boolean {
  if (!sub) return false;
  if (sub.subscriptionStatus !== 'ACTIVE' && sub.subscriptionStatus !== 'TRIALING') {
    return false;
  }
  if (sub.currentPeriodEnd) {
    const now = new Date();
    if (new Date(sub.currentPeriodEnd) < now) {
      return false;
    }
  }
  return true;
}

export function canAccessAdvancedStats(sub?: SubscriptionShape): boolean {
  return hasActivePro(sub);
}

export function canCustomizeCard(sub?: SubscriptionShape): boolean {
  return hasActivePro(sub);
}

export function canAccessFullHistory(sub?: SubscriptionShape): boolean {
  return hasActivePro(sub);
}

export function canAccessSeasonComparison(sub?: SubscriptionShape): boolean {
  return hasActivePro(sub);
}

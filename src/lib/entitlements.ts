export type SubscriptionStatusLike =
  | 'INACTIVE'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'TRIALING'
  | null
  | undefined;

export type SubscriptionShape = {
  subscriptionStatus?: SubscriptionStatusLike;
  currentPeriodEnd?: Date | string | null | undefined;
};

export function hasActivePro(
  sub: SubscriptionShape | null | undefined
): boolean {
  if (!sub) return false;
  const status = sub.subscriptionStatus;
  if (status !== 'ACTIVE' && status !== 'TRIALING') {
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

export function canAccessAdvancedStats(
  sub: SubscriptionShape | null | undefined
): boolean {
  return hasActivePro(sub);
}

export function canCustomizeCard(
  sub: SubscriptionShape | null | undefined
): boolean {
  return hasActivePro(sub);
}

export function canAccessFullHistory(
  sub: SubscriptionShape | null | undefined
): boolean {
  return hasActivePro(sub);
}

export function canAccessSeasonComparison(
  sub: SubscriptionShape | null | undefined
): boolean {
  return hasActivePro(sub);
}

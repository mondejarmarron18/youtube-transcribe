import tier from "@/constants/tier";

const envTier = process.env.TIER;

export const isFreeTier = envTier === tier.FREE || !envTier;
export const isPremiumTier = envTier === tier.PREMIUM;
export const isEnterpriseTier = envTier === tier.ENTERPRISE;

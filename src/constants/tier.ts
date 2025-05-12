const tier = {
  FREE: "free",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
} as const;

export type Tier = (typeof tier)[keyof typeof tier];

export default tier;

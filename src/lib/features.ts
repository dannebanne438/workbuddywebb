/** Feature IDs that can be toggled per workplace */
export const ALL_FEATURE_IDS = [
  "dashboard",
  "team-chat",
  "schedule",
  "checklists",
  "routines",
  "announcements",
  "incidents",
  "certificates",
  "employees",
  "documents",
  "photos",
] as const;

export type FeatureId = (typeof ALL_FEATURE_IDS)[number];

/** Returns enabled features from workplace settings, defaulting to all */
export function getEnabledFeatures(settings: Record<string, unknown> | null | undefined): string[] | null {
  if (!settings?.enabled_features) return null; // null = all enabled (backwards compat)
  return settings.enabled_features as string[];
}

/** Check if a specific view/feature is enabled */
export function isFeatureEnabled(
  featureId: string,
  settings: Record<string, unknown> | null | undefined,
  isSuperAdmin: boolean
): boolean {
  // Super admins always see everything
  if (isSuperAdmin) return true;
  // "camera" (WorkBuddy) is always enabled
  if (featureId === "camera") return true;
  // Admin-only views that aren't feature-gated
  if (featureId === "admin" || featureId === "workplace-detail" || featureId === "settings") return true;
  const enabled = getEnabledFeatures(settings);
  if (!enabled) return true; // no config = all enabled
  return enabled.includes(featureId);
}

import { supabase } from "@/integrations/supabase/client";
import { getCurrentPlanType } from "./subscription-utils";
import { getStorageLimit, hasContentLibrary, STORAGE_ADDON, PlanType } from "./stripe-mock";

// Format bytes to human readable string
export const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
};

// Get effective storage limit (tier limit + purchased add-ons)
export const getEffectiveStorageLimit = async (brandProfileId: string): Promise<number> => {
  // Get the brand's user_id to determine their plan
  const { data: brandProfile } = await supabase
    .from('brand_profiles')
    .select('user_id')
    .eq('id', brandProfileId)
    .maybeSingle();
  
  if (!brandProfile) return 0;
  
  const planType = await getCurrentPlanType(brandProfile.user_id);
  const baseLimit = getStorageLimit(planType);
  
  // Get additional storage from purchases
  const { data: purchases } = await supabase
    .from('storage_purchases')
    .select('storage_amount_bytes')
    .eq('brand_profile_id', brandProfileId)
    .eq('status', 'active');
  
  const extraStorage = purchases?.reduce((sum, p) => sum + (p.storage_amount_bytes || 0), 0) || 0;
  
  return baseLimit + extraStorage;
};

// Get current storage usage for a brand
export const getCurrentStorageUsage = async (brandProfileId: string): Promise<number> => {
  const { data } = await supabase
    .from('content_library')
    .select('file_size_bytes')
    .eq('brand_profile_id', brandProfileId);
  
  return data?.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0) || 0;
};

// Check if upload would exceed storage limit
export const canUploadFile = async (brandProfileId: string, fileSizeBytes: number): Promise<{
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remainingSpace: number;
}> => {
  const [currentUsage, limit] = await Promise.all([
    getCurrentStorageUsage(brandProfileId),
    getEffectiveStorageLimit(brandProfileId),
  ]);
  
  const remainingSpace = limit - currentUsage;
  const allowed = fileSizeBytes <= remainingSpace;
  
  return {
    allowed,
    currentUsage,
    limit,
    remainingSpace,
  };
};

// Calculate storage percentage used
export const getStoragePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};

// Check if user can use content library
export const canUseContentLibrary = async (userId: string): Promise<boolean> => {
  const planType = await getCurrentPlanType(userId);
  return hasContentLibrary(planType);
};

// Get storage tier info for display
export const getStorageTierInfo = (planType: PlanType): {
  hasAccess: boolean;
  limit: number;
  limitFormatted: string;
} => {
  const limit = getStorageLimit(planType);
  return {
    hasAccess: hasContentLibrary(planType),
    limit,
    limitFormatted: limit > 0 ? formatStorageSize(limit) : 'No access',
  };
};

// Calculate cost for additional storage
export const calculateStorageAddonCost = (gbNeeded: number): {
  addonsRequired: number;
  totalBytes: number;
  totalCents: number;
  totalFormatted: string;
} => {
  const bytesNeeded = gbNeeded * 1024 * 1024 * 1024;
  const addonsRequired = Math.ceil(bytesNeeded / STORAGE_ADDON.amountBytes);
  
  return {
    addonsRequired,
    totalBytes: addonsRequired * STORAGE_ADDON.amountBytes,
    totalCents: addonsRequired * STORAGE_ADDON.priceCents,
    totalFormatted: `$${(addonsRequired * STORAGE_ADDON.priceCents / 100).toFixed(2)}`,
  };
};

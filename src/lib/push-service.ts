import { supabase } from "@/integrations/supabase/client";

export type Platform = 'ios' | 'android';

export async function registerPushToken(
  userId: string,
  token: string,
  platform: Platform
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,token',
        }
      );

    if (error) {
      console.error('Error registering push token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to register push token:', error);
    return false;
  }
}

export async function unregisterPushToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .update({ is_active: false })
      .eq('token', token);

    if (error) {
      console.error('Error unregistering push token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to unregister push token:', error);
    return false;
  }
}

export async function updatePushToken(
  oldToken: string,
  newToken: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .update({
        token: newToken,
        updated_at: new Date().toISOString(),
      })
      .eq('token', oldToken);

    if (error) {
      console.error('Error updating push token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update push token:', error);
    return false;
  }
}

export async function getActiveTokensForUser(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching device tokens:', error);
      return [];
    }

    return data?.map((t) => t.token) || [];
  } catch (error) {
    console.error('Failed to fetch device tokens:', error);
    return [];
  }
}

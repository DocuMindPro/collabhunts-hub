import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeNativeAsync } from '@/lib/supabase-native';

interface NativeAppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
};

export function NativeAppLogo({ size = 'md', className = '' }: NativeAppLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const data = await safeNativeAsync(async () => {
        const res = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['native_app_logo_url', 'logo_icon_url']);
        return res.data;
      }, null);

      if (data) {
        const nativeLogo = data.find((d) => d.key === 'native_app_logo_url');
        const iconLogo = data.find((d) => d.key === 'logo_icon_url');
        setLogoUrl(nativeLogo?.value || iconLogo?.value || null);
      }
    };
    fetch();
  }, []);

  const sizeClass = SIZES[size];

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt="Collab Hunts"
        className={`${sizeClass} rounded-2xl object-cover shadow-lg ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClass} bg-primary rounded-2xl flex items-center justify-center shadow-lg ${className}`}>
      <span className="text-3xl font-bold text-primary-foreground">CH</span>
    </div>
  );
}

export default NativeAppLogo;

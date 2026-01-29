import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVerificationSettings = () => {
  const [settings, setSettings] = useState({
    requirePhone: true,
    requireEmail: true,
    loading: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["require_phone_verification", "require_email_verification"]);

      if (data) {
        const phoneRequired = data.find(s => s.key === "require_phone_verification")?.value !== "false";
        const emailRequired = data.find(s => s.key === "require_email_verification")?.value !== "false";
        setSettings({
          requirePhone: phoneRequired,
          requireEmail: emailRequired,
          loading: false
        });
      } else {
        setSettings(s => ({ ...s, loading: false }));
      }
    };

    fetchSettings();
  }, []);

  return settings;
};

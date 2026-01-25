import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export const useMobileNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "overview";

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams({ tab });
    },
    [setSearchParams]
  );

  return { activeTab, setActiveTab };
};

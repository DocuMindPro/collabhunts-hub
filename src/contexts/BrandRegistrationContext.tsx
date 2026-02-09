import { createContext, useContext } from "react";

interface BrandRegistrationContextType {
  registrationCompleted: boolean;
}

export const BrandRegistrationContext = createContext<BrandRegistrationContextType>({
  registrationCompleted: true,
});

export const useBrandRegistration = () => useContext(BrandRegistrationContext);

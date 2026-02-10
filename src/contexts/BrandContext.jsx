import React, { createContext, useContext, useState } from 'react';
import BRAND_CONFIG from '../config/brand-config';

// Create the Brand Context
const BrandContext = createContext();

// Brand Provider Component
export const BrandProvider = ({ children }) => {
  const [brandConfig, setBrandConfig] = useState(BRAND_CONFIG);

  // Function to update brand configuration
  const updateBrandConfig = (newConfig) => {
    setBrandConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  };

  // Function to update specific section of brand config
  const updateBrandSection = (section, newValues) => {
    setBrandConfig(prevConfig => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section],
        ...newValues
      }
    }));
  };

  const value = {
    brandConfig,
    updateBrandConfig,
    updateBrandSection,
    getCompanyInfo: () => brandConfig.company,
    getLegalInfo: () => brandConfig.legal,
    getBrandColors: () => brandConfig.colors,
    getBrandAssets: () => brandConfig.assets,
    getDefaultContact: () => brandConfig.defaultContact,
    getDefaultGSTNumbers: () => brandConfig.defaultGSTNumbers,
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

// Custom hook to use the Brand Context
export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
 return context;
};

export default BrandContext;

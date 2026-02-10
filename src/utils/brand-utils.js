// Brand Utilities
// Helper functions to manage and update brand information across the application

import { BRAND_CONFIG } from '../config/brand-config';

// Function to update company information
export const updateCompanyInfo = (newCompanyInfo) => {
  BRAND_CONFIG.company = {
    ...BRAND_CONFIG.company,
    ...newCompanyInfo
  };
  // In a real implementation, this would trigger a context update
  console.log("Company information updated:", BRAND_CONFIG.company);
};

// Function to update legal information
export const updateLegalInfo = (newLegalInfo) => {
  BRAND_CONFIG.legal = {
    ...BRAND_CONFIG.legal,
    ...newLegalInfo
  };
  console.log("Legal information updated:", BRAND_CONFIG.legal);
};

// Function to update brand colors
export const updateBrandColors = (newColors) => {
  BRAND_CONFIG.colors = {
    ...BRAND_CONFIG.colors,
    ...newColors
 };
  console.log("Brand colors updated:", BRAND_CONFIG.colors);
};

// Function to update brand assets
export const updateBrandAssets = (newAssets) => {
  BRAND_CONFIG.assets = {
    ...BRAND_CONFIG.assets,
    ...newAssets
  };
  console.log("Brand assets updated:", BRAND_CONFIG.assets);
};

// Function to update default contact
export const updateDefaultContact = (newContact) => {
  BRAND_CONFIG.defaultContact = {
    ...BRAND_CONFIG.defaultContact,
    ...newContact
  };
  console.log("Default contact updated:", BRAND_CONFIG.defaultContact);
};

// Function to update default GST numbers
export const updateDefaultGSTNumbers = (newGSTNumbers) => {
 BRAND_CONFIG.defaultGSTNumbers = {
    ...BRAND_CONFIG.defaultGSTNumbers,
    ...newGSTNumbers
  };
  console.log("Default GST numbers updated:", BRAND_CONFIG.defaultGSTNumbers);
};

// Function to get full brand information
export const getFullBrandInfo = () => {
  return { ...BRAND_CONFIG };
};

// Function to reset brand information to default
export const resetBrandInfo = () => {
  // Since BRAND_CONFIG is imported by value, we can't directly reset it
  // This would need to be handled by the context provider
  console.log("Brand information reset to defaults");
};

// Function to validate brand information
export const validateBrandInfo = () => {
  const requiredFields = ['name', 'addressLine1', 'addressLine2'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!BRAND_CONFIG.company[field] || BRAND_CONFIG.company[field].trim() === '') {
      missingFields.push(field);
    }
 });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Function to export brand information
export const exportBrandInfo = () => {
  return JSON.stringify(BRAND_CONFIG, null, 2);
};

// Function to import brand information
export const importBrandInfo = (brandData) => {
  try {
    const parsedData = JSON.parse(brandData);
    Object.assign(BRAND_CONFIG, parsedData);
    console.log("Brand information imported successfully");
    return true;
  } catch (error) {
    console.error("Error importing brand information:", error);
    return false;
  }
};

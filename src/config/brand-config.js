// Centralized Brand Configuration
// All branding information for the application

const BRAND_CONFIG = {
  // Company Information
  company: {
    name: "M/s BPC INFRAPROJECTS PVT LTD",
    addressLine1: "Galaxia Mall, Unit - 12, 2nd Floor, Piska More, Ratu Road",
    addressLine2: "Ranchi - 834005",
    contact: "+91 947110087",
    email: "info@bpcinfra.com", // Added for completeness
    website: "www.bpcinfra.com", // Added for completeness
  },
  
  // Legal Information
  legal: {
    gstNo: "21AABCT4589R1ZP",
    panNo: "ABCDE1234F", // Placeholder
    registrationNo: "XXXXX", // Placeholder
  },
  
  // Brand Colors (for UI elements)
  colors: {
    primary: "#1f2937", // gray-800
    secondary: "#3b82f6", // blue-500
    accent: "#ef4444", // red-500
    success: "#22c55e", // green-500
    warning: "#f59e0b", // amber-500
    info: "#0ea5e9", // sky-500
    background: "#f9fafb", // gray-50
    surface: "#ffffff", // white
  },
  
  // Brand Typography
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headings: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: "600",
    },
    body: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: "400",
    },
  },
  
  // Brand Assets
  assets: {
    logo: "/src/assets/icons/company-logo.jpeg", // Path to logo
    favicon: "/src/assets/icons/favicon.ico", // Path to favicon
  },
  
  // Default Contact Person
  defaultContact: {
    name: "SUKUMAR SAHU",
    designation: "Site Manager",
    mobile: "+91 9471100887",
  },
  
  // Default GST Numbers for different contexts
  defaultGSTNumbers: {
    from: "21ABCT4589R1ZP",
    to: "20AABCT4589R1ZR", // For transfers
  },
  
  // Social Media and Other Links
  social: {
    linkedin: "",
    facebook: "",
    twitter: "",
  },
};

// Function to get company information
const getCompanyInfo = () => {
  return BRAND_CONFIG.company;
};

// Function to get legal information
const getLegalInfo = () => {
  return BRAND_CONFIG.legal;
};

// Function to get brand colors
const getBrandColors = () => {
  return BRAND_CONFIG.colors;
};

// Function to get brand assets
const getBrandAssets = () => {
  return BRAND_CONFIG.assets;
};

// Function to get default contact
const getDefaultContact = () => {
  return BRAND_CONFIG.defaultContact;
};

// Function to get default GST numbers
const getDefaultGSTNumbers = () => {
  return BRAND_CONFIG.defaultGSTNumbers;
};

export {
  BRAND_CONFIG,
  getCompanyInfo,
  getLegalInfo,
  getBrandColors,
  getBrandAssets,
  getDefaultContact,
  getDefaultGSTNumbers,
};

export default BRAND_CONFIG;

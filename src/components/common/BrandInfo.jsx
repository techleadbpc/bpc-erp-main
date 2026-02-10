import React from 'react';
import { useBrand } from '../../contexts/BrandContext';

const BrandInfo = ({ 
  showName = true, 
  showAddress = true, 
  showContact = false,
  showGST = false,
  className = "",
  variant = "default" // "default", "compact", "full"
}) => {
  const { getCompanyInfo, getDefaultContact, getLegalInfo } = useBrand();
  const companyInfo = getCompanyInfo();
  const contactInfo = getDefaultContact();
  const legalInfo = getLegalInfo();

  const renderContent = () => {
    switch (variant) {
      case "compact":
        return (
          <div className={`space-y-1 ${className}`}>
            {showName && <div className="font-semibold">{companyInfo.name}</div>}
            {showAddress && (
              <div className="text-sm">
                {companyInfo.addressLine1}, {companyInfo.addressLine2}
              </div>
            )}
          </div>
        );
      
      case "full":
        return (
          <div className={`space-y-2 ${className}`}>
            {showName && <div className="text-lg font-bold">{companyInfo.name}</div>}
            {showAddress && (
              <div>
                <div>{companyInfo.addressLine1}</div>
                <div>{companyInfo.addressLine2}</div>
              </div>
            )}
            {showContact && (
              <div>
                <div>Contact: {companyInfo.contact}</div>
                <div>Attn: {contactInfo.name} ({contactInfo.designation})</div>
              </div>
            )}
            {showGST && (
              <div className="text-sm text-gray-600">
                GST No: {legalInfo.gstNo}
              </div>
            )}
          </div>
        );
      
      default: // "default"
        return (
          <div className={`space-y-1 ${className}`}>
            {showName && <div className="font-semibold">{companyInfo.name}</div>}
            {showAddress && (
              <div className="text-sm">
                {companyInfo.addressLine1}
              </div>
            )}
            {showAddress && (
              <div className="text-sm">
                {companyInfo.addressLine2}
              </div>
            )}
            {showContact && companyInfo.contact && (
              <div className="text-sm">
                Contact: {companyInfo.contact}
              </div>
            )}
            {showGST && legalInfo.gstNo && (
              <div className="text-sm text-gray-600">
                GST No: {legalInfo.gstNo}
              </div>
            )}
          </div>
        );
    }
  };

  return renderContent();
};

export default BrandInfo;

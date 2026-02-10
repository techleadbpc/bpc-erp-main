import React from "react";
import { Text, View, Image } from "@react-pdf/renderer";
import PDFStyles from "./PDFStyles";
import { getCompanyInfo, getDefaultContact } from "../../config/brand-config";

const PDFHeader = ({ 
  title, 
  dateInfo = [], 
  showCompanyInfo = true, 
  showLogo = false, 
  customCompanyInfo = null,
  additionalInfo = null,
  showContact = false // New prop to optionally show contact info
}) => {
  const companyInfo = customCompanyInfo || getCompanyInfo();
  const contactInfo = getDefaultContact();

  return (
    <View>
      {/* Header */}
      <View style={PDFStyles.header}>
        {showCompanyInfo && (
          <View style={customCompanyInfo ? PDFStyles.companyInfoNarrow : PDFStyles.companyInfo}>
            <Text style={PDFStyles.companyName}>{companyInfo.name}</Text>
            <Text style={PDFStyles.companyAddress}>{companyInfo.addressLine1}</Text>
            <Text style={PDFStyles.companyAddress}>{companyInfo.addressLine2}</Text>
            {showContact && companyInfo.contact && (
              <Text style={PDFStyles.companyAddress}>Contact: {companyInfo.contact}</Text>
            )}
          </View>
        )}
        
        <View style={showCompanyInfo ? PDFStyles.dateInfo : { width: "100%", alignItems: "flex-end" }}>
          {showLogo && companyInfo.logo && (
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Image src={companyInfo.logo} style={{ width: 50, height: 50 }} />
            </View>
          )}
          {dateInfo.map((info, index) => (
            <Text key={index}>{info.label}: {info.value}</Text>
          ))}
        </View>
      </View>

      {/* Title */}
      {title && <Text style={PDFStyles.title}>{title}</Text>}

      {/* Additional Information */}
      {additionalInfo && <View>{additionalInfo}</View>}
    </View>
  );
};

export default PDFHeader;

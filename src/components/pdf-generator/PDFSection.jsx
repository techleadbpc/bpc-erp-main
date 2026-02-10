import React from "react";
import { Text, View } from "@react-pdf/renderer";
import PDFStyles from "./PDFStyles";
import { getCompanyInfo, getDefaultContact, getLegalInfo } from "../../config/brand-config";

const PDFSection = ({ 
 title = null, 
 children, 
  showBorder = true, 
  customStyle = null,
  fields = [],
  sectionType = "default" // 'default', 'double', 'single'
}) => {
  if (sectionType === 'double') {
    return (
      <View style={showBorder ? PDFStyles.sectionContainer : { marginBottom: 10 }}>
        <View style={PDFStyles.section}>
          {title && <Text style={PDFStyles.sectionTitle}>{title.left}</Text>}
          {fields.left && fields.left.map((field, index) => (
            <View key={index} style={PDFStyles.row}>
              <Text style={PDFStyles.label}>{field.label}:</Text>
              <Text style={PDFStyles.value}>{field.value}</Text>
            </View>
          ))}
          {children && children.left && <View>{children.left}</View>}
        </View>
        <View style={PDFStyles.sectionRight}>
          {title && <Text style={PDFStyles.sectionTitle}>{title.right}</Text>}
          {fields.right && fields.right.map((field, index) => (
            <View key={index} style={PDFStyles.row}>
              <Text style={PDFStyles.label}>{field.label}:</Text>
              <Text style={PDFStyles.value}>{field.value}</Text>
            </View>
          ))}
          {children && children.right && <View>{children.right}</View>}
        </View>
      </View>
    );
  } else if (sectionType === 'single') {
    return (
      <View style={customStyle || { marginBottom: 10 }}>
        {title && <Text style={PDFStyles.sectionTitle}>{title}</Text>}
        {fields.map((field, index) => (
          <View key={index} style={PDFStyles.row}>
            <Text style={PDFStyles.label}>{field.label}:</Text>
            <Text style={PDFStyles.value}>{field.value}</Text>
          </View>
        ))}
        {children}
      </View>
    );
  } else {
    return (
      <View style={customStyle || { marginBottom: 10 }}>
        {title && <Text style={PDFStyles.sectionTitle}>{title}</Text>}
        {children}
      </View>
    );
  }
};

export default PDFSection;

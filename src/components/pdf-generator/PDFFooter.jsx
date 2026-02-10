import React from "react";
import { Text, View } from "@react-pdf/renderer";
import PDFStyles from "./PDFStyles";

const PDFFooter = ({ 
  signatureBlocks = [], 
  showDivider = false, 
  customStyle = null,
  watermark = null
}) => {
  return (
    <View>
      {watermark && (
        <Text style={PDFStyles.watermark}>{watermark}</Text>
      )}
      
      {showDivider && (
        <View style={PDFStyles.divider} />
      )}
      
      <View style={customStyle || PDFStyles.footer}>
        {signatureBlocks.map((block, index) => (
          <View key={index} style={block.style || PDFStyles.signature}>
            <Text>{block.label}</Text>
            {block.value && <Text>{block.value}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
};

export default PDFFooter;

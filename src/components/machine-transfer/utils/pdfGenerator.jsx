// utils/pdfGenerator.js
import { pdf } from "@react-pdf/renderer";
import TransferChallanPDF from "../transfer-challan-pdf";

export const generateChallanPDF = async (transfer) => {
  try {
    const blob = await pdf(<TransferChallanPDF transfer={transfer} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transfer-challan-${transfer.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

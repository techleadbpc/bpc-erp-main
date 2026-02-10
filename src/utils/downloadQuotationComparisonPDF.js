import React from 'react';
import { pdf } from '@react-pdf/renderer';
import QuotationComparisonPDF from '@/app/quotation-comparison/components/QuotationComparisonPDF';

const downloadQuotationComparisonPDF = (comparison) => {
  if (!comparison) {
    console.error('No comparison data provided');
    return;
  }

  try {
    // Create the PDF document using React.createElement instead of JSX
    const pdfDocument = React.createElement(QuotationComparisonPDF, { comparison });
    
    // Generate the PDF and download it using the pdf() function directly
    pdf(pdfDocument)
      .toBlob()
      .then(blob => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Quotation-Comparison-${comparison.comparisonNo}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          console.error('Failed to generate PDF blob');
          alert('Error generating PDF. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      });
  } catch (error) {
    console.error('Error in downloadQuotationComparisonPDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

export default downloadQuotationComparisonPDF;

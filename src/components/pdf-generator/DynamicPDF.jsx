import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import PDFHeader from "./PDFHeader.jsx";
import PDFFooter from "./PDFFooter.jsx";
import PDFTable from "./PDFTable.jsx";
import PDFSection from "./PDFSection.jsx";
import PDFStyles from "./PDFStyles";

// Date formatting utility
const formatDate = (dateString) => {
 try {
    if (!dateString) return "N/A";
    return format(parseISO(dateString), "dd-MMM-yyyy");
  } catch (error) {
    return dateString;
  }
};

// Currency formatting utility
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return amount || "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const DynamicPDF = ({ config, data }) => {
  const {
    title = "",
    companyInfo = null,
    showLogo = false,
    dateInfo = [],
    headerAdditionalInfo = null,
    sections = [],
    tables = [],
    footerConfig = {},
    watermark = null,
    pageStyle = "page"
  } = config;

  return (
    <Document>
      <Page size="A4" style={PDFStyles[pageStyle]}>
        {/* Header */}
        <PDFHeader
          title={title}
          dateInfo={dateInfo}
          showCompanyInfo={!companyInfo || Object.keys(companyInfo).length > 0}
          showLogo={showLogo}
          customCompanyInfo={companyInfo}
          additionalInfo={headerAdditionalInfo}
        />

        {/* Sections */}
        {sections.map((section, index) => (
          <PDFSection
            key={index}
            title={section.title}
            sectionType={section.type}
            fields={section.fields}
            showBorder={section.showBorder !== false}
          >
            {section.children}
          </PDFSection>
        ))}

        {/* Tables */}
        {tables.map((table, index) => (
          <PDFTable
            key={index}
            headers={table.headers}
            data={table.data}
            widths={table.widths}
            showTotal={table.showTotal}
            totalRow={table.totalRow}
          />
        ))}

        {/* Footer */}
        <PDFFooter
          signatureBlocks={footerConfig.signatureBlocks || []}
          showDivider={footerConfig.showDivider}
          watermark={watermark}
        />
      </Page>
    </Document>
  );
};

export default DynamicPDF;

// Export utility functions
export { formatDate, formatCurrency };

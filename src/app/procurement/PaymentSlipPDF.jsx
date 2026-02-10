import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DynamicPDF, formatDate, formatCurrency } from "../../components/pdf-generator";

const PaymentSlipPDF = ({ payment, invoice, vendor }) => {
  // Build date info
  const dateInfo = [
    { label: "Slip No", value: payment.slipNo }
  ];

  // Build sections
  const sections = [
    // Payment Details section
    {
      type: "single",
      title: "Payment Details",
      fields: [
        { label: "Payment Date", value: formatDate(payment.paymentDate) },
        { label: "Payment Status", value: payment.status },
        ...(payment.paidAt ? [{ label: "Paid On", value: formatDate(payment.paidAt) }] : []),
        { label: "Amount", value: formatCurrency(payment.amount) },
        ...(payment.remarks ? [{ label: "Remarks", value: payment.remarks }] : [])
      ]
    },
    // Vendor Information section
    {
      type: "single",
      title: "Vendor Information",
      fields: [
        { label: "Vendor Name", value: vendor?.name || "N/A" },
        ...(vendor?.contactPerson ? [{ label: "Contact Person", value: vendor.contactPerson }] : []),
        ...(vendor?.phoneNumber ? [{ label: "Phone Number", value: vendor.phoneNumber }] : [])
      ]
    },
    // Invoice Information section
    {
      type: "single",
      title: "Invoice Information",
      fields: [
        { label: "Invoice No", value: invoice?.invoiceNo || "N/A" },
        { label: "Invoice Date", value: formatDate(invoice?.invoiceDate) },
        { label: "Invoice Amount", value: formatCurrency(invoice?.amount || 0) }
      ]
    },
    // Payment Declaration section
    {
      children: (
        <View style={{ marginBottom: 20 }}>
          <Text>
            This document serves as confirmation that payment has been 
            {payment.status.toLowerCase() === "paid" ? " made " : " scheduled "} 
            to the above vendor for the specified invoice. 
            {payment.remarks && ` Note: ${payment.remarks}`}
          </Text>
        </View>
      )
    }
  ];

  // Build footer configuration
  const footerConfig = {
    signatureBlocks: [
      { label: "Prepared By", value: "" },
      { label: "Authorized Signature", value: "" }
    ]
  };

  // Configuration for the dynamic PDF
  const config = {
    title: "Payment Slip",
    dateInfo: dateInfo,
    sections: sections,
    footerConfig: footerConfig,
    watermark: payment.status.toUpperCase(),
    pageStyle: "pageWithMorePadding"
  };

  return <DynamicPDF config={config} data={{ payment, invoice, vendor }} />;
};

export default PaymentSlipPDF;

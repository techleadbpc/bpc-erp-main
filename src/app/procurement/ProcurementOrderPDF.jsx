import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DynamicPDF, formatDate } from "../../components/pdf-generator";

const ProcurementOrderPDF = ({ formData, items }) => {
  // Calculate total amount
  const totalAmount = items?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // Build date info
  const dateInfo = [
    { label: "PO No", value: formData.procurementNo },
    { label: "Date", value: formatDate(formData.createdAt) },
    { label: "Expected Delivery", value: formatDate(formData.expectedDelivery) }
  ];

  // Build sections
  const sections = [
    // Vendor and Order Details sections
    {
      type: "double",
      title: {
        left: "Vendor Details",
        right: "Order Details"
      },
      fields: {
        left: [
          { label: "Name", value: formData.Vendor?.name },
          { label: "Contact Person", value: formData.Vendor?.contactPerson },
          { label: "Email", value: formData.Vendor?.email },
          { label: "Phone", value: formData.Vendor?.phone || "N/A" },
          { label: "Address", value: formData.Vendor?.address }
        ],
        right: [
          { label: "Status", value: formData.status?.toUpperCase() },
          { label: "Requisition No", value: formData.Requisition?.requisitionNo },
          { label: "GST No.", value: "21AABCT4589R1ZP" }
        ]
      }
    },
    // Note section
    {
      children: (
        <View style={{ borderWidth: 1, borderColor: "#000", padding: 8, marginBottom: 10, backgroundColor: "#f0f0f0" }}>
          <Text style={{ fontStyle: "italic" }}>
            This Procurement Order is issued for the supply of materials as per the specifications mentioned below.
          </Text>
          <Text style={{ fontStyle: "italic" }}>
            Please ensure timely delivery as per the agreed terms and conditions.
          </Text>
        </View>
      )
    },
    // Narration section
    {
      children: (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Narration:</Text>
          <Text>Procurement order for materials as per requisition</Text>
          <Text>Status: {formData.status}</Text>
          {formData.notes && <Text>Notes: {formData.notes}</Text>}
        </View>
      )
    }
  ];

  // Build table data
  const procurementTable = {
    headers: ["S.No.", "Item Code", "HSN Code", "Material Description", "Part No.", "UOM", "Quantity", "Rate (₹)", "Amount (₹)"],
    widths: ["8%", "8%", "8%", "30%", "10%", "8%", "8%", "10%", "10%"],
    data: items?.map((item, index) => [
      (index + 1).toString(),
      item.RequisitionItem?.Item?.id || "-",
      item.RequisitionItem?.Item?.hsnCode || "-",
      item.RequisitionItem?.Item?.name || "-",
      item.RequisitionItem?.Item?.partNumber || "-",
      item.RequisitionItem?.Item?.Unit?.shortName || "Nos",
      item.quantity.toString(),
      parseFloat(item.rate || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      parseFloat(item.amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    ]) || [],
    showTotal: true,
    totalRow: [
      "Total Amount",
      "",
      "",
      "",
      `₹${totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    ]
  };

  // Build footer configuration
  const footerConfig = {
    signatureBlocks: [
      { label: "Prepared By", value: "" },
      { label: "Checked By", value: "" },
      { label: "Approved By", value: "" }
    ]
  };

  // Configuration for the dynamic PDF
  const config = {
    title: "PROCUREMENT ORDER",
    dateInfo: dateInfo,
    sections: sections,
    tables: [procurementTable],
    footerConfig: footerConfig
  };

  return <DynamicPDF config={config} data={{ formData, items }} />;
};

export default ProcurementOrderPDF;

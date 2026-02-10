import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DynamicPDF, formatDate } from "../../components/pdf-generator";

const MaterialIssuePDF = ({ formData, items }) => {
  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Determine if it's a transfer or consumption
  const isTransfer =
    formData.issueType === "Site Transfer" ||
    (formData.toSite && formData.toSite !== "");

 // Build date info
  const dateInfo = [
    { label: "Issue No", value: formData.issueNo },
    { label: "Date", value: formatDate(formData.issueDate) },
    { label: "Time", value: formData.issueTime }
  ];

  // Build sections
  const sections = [
    // From/To sections
    {
      type: "double",
      title: {
        left: "From",
        right: "To"
      },
      fields: {
        left: [
          { label: "Site", value: formData.fromSite },
          { label: "Location", value: formData.fromSite },
          { label: "GST No.", value: "21AABCT4589R1ZP" },
          { label: "Contact Person", value: "SUKUMAR SAHU" }
        ],
        right: isTransfer 
          ? [
              { label: "Site", value: formData.toSite },
              { label: "Location", value: formData.toSite },
              { label: "GST No.", value: "20AABCT4589R1ZR" }
            ]
          : [
              { 
                label: items[0]?.issueTo?.toLowerCase()?.includes("vehicle") ? "Vehicle" : "Issue To", 
                value: items[0]?.issueTo || "N/A" 
              }
            ]
      }
    },
    // Note section
    {
      children: (
        <View style={{ borderWidth: 1, borderColor: "#000", padding: 8, marginBottom: 10, backgroundColor: "#f0f0" }}>
          <Text style={{ fontStyle: "italic" }}>
            We are dispatching the following items basis for OUR OWN USE and Not
            For Sale/Resale.
          </Text>
          <Text style={{ fontStyle: "italic" }}>
            And the concerned/Authority are requested to allow uninterrupted
            transport/Non of these materials.
          </Text>
        </View>
      )
    },
    // Narrative section
    {
      children: (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Narration:</Text>
          <Text>
            Material issued for{" "}
            {isTransfer ? "transfer to " + formData.toSite : "consumption"}
          </Text>
          <Text>Status: {formData.status}</Text>
        </View>
      )
    }
  ];

  // Build table data
 const materialTable = {
    headers: ["S.No.", "Item Code", "HSN Code", "Material Description", "Part no.", "UOM", "MR QTY", "STN QTY", "Remarks"],
    widths: ["8%", "8%", "8%", "30%", "10%", "8%", "8%", "10%", "10%"],
    data: items.map((item, index) => [
      (index + 1).toString(),
      item.itemId || item.Item?.id || "-",
      item.Item?.hsnCode || "-",
      item.Item?.name || "-",
      item.Item?.partNumber || "-",
      item.Item?.unitId || "Nos",
      "0",
      item.quantity.toString(),
      "-"
    ]),
    showTotal: true,
    totalRow: [
      "Total",
      "",
      "",
      "",
      "0",
      totalQuantity.toString(),
      ""
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
    title: isTransfer ? "STOCK TRANSFER NOTE" : "MATERIAL ISSUE SLIP",
    dateInfo: dateInfo,
    sections: sections,
    tables: [materialTable],
    footerConfig: footerConfig
  };

 return <DynamicPDF config={config} data={{ formData, items }} />;
};

export default MaterialIssuePDF;

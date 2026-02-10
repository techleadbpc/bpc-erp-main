import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DynamicPDF, formatDate } from "../../../components/pdf-generator";
import { getCompanyInfo } from "../../../config/brand-config";

const MaterialRequisitionPDF = ({ formData, items }) => {
  // Calculate total quantity
  const totalQuantity = items?.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  // Get sanction status
  const getSanctionStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "APPROVED";
      case "rejected":
        return "REJECTED";
      default:
        return "PENDING";
    }
 };

  // Build date info
  const dateInfo = [
    { label: "Requisition No.", value: formData?.requisitionNo },
    { label: "Request Date", value: `${formatDate(formData?.requestedAt)} ${formData?.time || ""}` }
  ];

  // Get company info for team text
  const companyInfo = getCompanyInfo();

  // Build sections
  const sections = [
    // Site details section
    {
      type: "double",
      title: {
        left: "Requesting Site",
        right: "Requisition Details"
      },
      fields: {
        left: [
          { label: "Site Name", value: formData?.requestingSite?.name || "N/A" },
          { label: "Site Code", value: formData?.requestingSite?.code || "N/A" },
          { label: "Location", value: formData?.requestingSite?.address || "N/A" },
          { label: "Contact", value: formData?.requestingSite?.mobileNumber || "N/A" }
        ],
        right: [
          { label: "Status", value: formData?.status },
          { label: "Charge Type", value: formData?.chargeType },
          { label: "Due Date", value: formatDate(formData?.dueDate) }
        ]
      }
    },
    // Team text section
    {
      children: (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>{companyInfo.name.replace("M/s ", "").replace(" INFRAPROJECTS PVT LTD", "")} INFRAPROJECTS TEAM</Text>
        </View>
      )
    }
  ];

  // Build table data
 const requisitionTable = {
    headers: ["S. No.", "Item ID", "Part No.", "Material Description", "HSN Code", "Req. Qty", "Issue Qty", "UOM", "Group", "Remark"],
    widths: ["5%", "8%", "10%", "24%", "8%", "8%", "8%", "8%", "8%", "13%"],
    data: items?.map((item, index) => [
      (index + 1).toString(),
      item.id || "-",
      item.Item?.partNumber || "-",
      `${item.Item?.name || "-"}\n[SANCTION: ${getSanctionStatus(formData?.status)}]`,
      item.Item?.hsnCode || "-",
      item.quantity.toString(),
      "-",
      item.Item?.unitId || "Unit",
      item.Item?.itemGroupId || "Group",
      `Site: ${formData?.requestingSite?.name || "-"}\nPriority: ${formData?.requestPriority}\nDue Date: ${formatDate(formData?.dueDate)}`
    ]) || [],
    showTotal: true,
    totalRow: [
      "Total",
      "",
      "",
      "",
      "",
      totalQuantity.toString(),
      "-",
      "",
      "",
      ""
    ]
  };

  // Build footer configuration
  const footerConfig = {
    signatureBlocks: [
      { label: "Requisitioner", value: formData?.preparedBy?.name || "N/A" },
      { label: "Approved By", value: formData?.approvedBy?.name || "N/A" },
      { label: "Issuer", value: "" },
      { label: "Store Manager", value: "" },
      { label: "Receiver", value: formData?.receivedBy?.name || "N/A" }
    ]
  };

  // Configuration for the dynamic PDF
  const config = {
    title: "MATERIAL REQUISITION SLIP",
    dateInfo: dateInfo,
    sections: sections,
    tables: [requisitionTable],
    footerConfig: footerConfig
  };

  return <DynamicPDF config={config} data={{ formData, items }} />;
};

export default MaterialRequisitionPDF;

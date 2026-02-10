import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DynamicPDF, formatDate } from "../pdf-generator";

const TransferChallanPDF = ({ transfer }) => {
  // Determine titles based on request type
  const getChallanTitle = () => {
    if (transfer.requestType === "Site Transfer") return "MACHINE TRANSFER CHALLAN";
    if (transfer.requestType === "Sell") return "MACHINE SALE CHALLAN";
    return "MACHINE SCRAP CHALLAN";
  };

  const getToTitle = () => {
    if (transfer.requestType === "Site Transfer") return "TO";
    if (transfer.requestType === "Sell") return "BUYER";
    return "SCRAP VENDOR";
  };

  const getSignatureTitle = () => {
    if (transfer.requestType === "Site Transfer") return "Receiver's Signature";
    if (transfer.requestType === "Sell") return "Buyer's Signature";
    return "Vendor's Signature";
  };

  // Build date info
  const dateInfo = [
    { label: "Challan No", value: transfer.id },
    { label: "Date", value: formatDate(transfer.approvedAt) },
    { label: "Time", value: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
  ];

  // Build sections
  const sections = [
    // From/To sections
    {
      type: "double",
      title: {
        left: "From",
        right: getToTitle()
      },
      fields: {
        left: [
          { label: "Site Name", value: transfer?.currentSite?.name },
          { label: "Site Code", value: transfer?.currentSite?.code }
        ],
        right: transfer.requestType === "Site Transfer"
          ? [
            { label: "Site Name", value: transfer?.destinationSite?.name },
            { label: "Site Code", value: transfer?.destinationSite?.code }
          ]
          : transfer.requestType === "Sell"
            ? [
              { label: "Contact", value: transfer.buyerContact || "N/A" },
              { label: "Address", value: transfer.buyerAddress || "N/A" }
            ]
            : [
              { label: "Contact", value: transfer.scrapVendorContact || "N/A" },
              { label: "Address", value: transfer.scrapVendorAddress || "N/A" }
            ]
      }
    },
    // Note section
    {
      children: (
        <View style={{ borderWidth: 1, borderColor: "#00", padding: 8, marginBottom: 10, backgroundColor: "#f0f0" }}>
          <Text style={{ fontStyle: "italic" }}>
            We are{" "}
            {transfer.requestType === "Site Transfer"
              ? "transferring"
              : transfer.requestType === "Sell"
                ? "selling"
                : "scrapping"}{" "}
            the following machine for OUR OWN USE and Not For Sale/Resale.
          </Text>
          <Text style={{ fontStyle: "italic" }}>
            The concerned Authority is requested to allow uninterrupted
            transport of this machine.
          </Text>
        </View>
      )
    },
    // Transport details section
    {
      type: "double",
      title: {
        left: "Transport Details",
        right: transfer.requestType === "Sell"
          ? "Sale Details"
          : transfer.requestType === "Scrap"
            ? "Scrap Details"
            : "Additional Info"
      },
      fields: {
        left: [
          { label: "Vehicle No", value: transfer.transportDetails?.vehicleNumber || "N/A" },
          { label: "Driver Name", value: transfer.transportDetails?.driverName || "N/A" },
          { label: "Driver Contact", value: transfer.transportDetails?.mobileNumber || "N/A" }
        ],
        right: [
          { label: "Approved By", value: transfer?.approver?.name || "N/A" },
          ...(transfer.requestType === "Sell"
            ? [{ label: "Sale Amount", value: `₹${transfer.saleAmount ? transfer.saleAmount : "N/A"}` }]
            : transfer.requestType === "Scrap"
              ? [{ label: "Scrap Value", value: `₹${transfer.scrapValue ? transfer.scrapValue : "N/A"}` }]
              : [])
        ]
      }
    },
    // Narration section
    {
      children: (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Narration:</Text>
          <Text>
            Machine{" "}
            {transfer.requestType === "Site Transfer"
              ? "transfer"
              : transfer.requestType === "Sell"
                ? "sale"
                : "scrap"}{" "}
            as per approval
          </Text>
          <Text>Status: {transfer.status}</Text>
          <Text>Reference: {transfer.requestType}</Text>
        </View>
      )
    }
  ];

  // Build table data for machine details
  const machineTable = {
    headers: ["S.No.", "Machine Code", "Machine Name", "Model", "Serial No.", "Registration No.", "Condition", "Remarks"],
    widths: ["8%", "15%", "25%", "15%", "15%", "12%", "10%"],
    data: [
      [
        "1",
        transfer.machine?.machineCode ?? transfer.machine.erpCode ?? "",
        transfer.machine?.machineName ?? "",
        transfer.machine?.model ?? "N/A",
        transfer.machine?.serialNumber ?? "N/A",
        transfer.machine.registrationNumber ?? "N/A",
        "Working",
        "-"
      ]
    ]
  };

  // Build footer configuration
  const footerConfig = {
    signatureBlocks: [
      { label: "Authorized By", value: "" },
      { label: "Prepared By", value: "" },
      { label: getSignatureTitle(), value: "" }
    ]
  };

  // Configuration for the dynamic PDF
  const config = {
    title: getChallanTitle(),
    dateInfo: dateInfo,
    sections: sections,
    tables: [machineTable],
    footerConfig: footerConfig
  };

  return <DynamicPDF config={config} data={transfer} />;
};

export default TransferChallanPDF;

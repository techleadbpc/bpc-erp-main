import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { DynamicPDF, formatDate } from "../pdf-generator";

const LogbookPDF = ({ entry }) => {
  // Calculate diesel used
  const dieselUsed =
    entry.dieselOpeningBalance + entry.dieselIssue - entry.dieselClosingBalance;

  // Build date info
  const dateInfo = [
    { label: "Entry No", value: `#${entry.id}` },
    { label: "Date", value: formatDate(entry.date) }
  ];

  // Build sections
  const sections = [
    // Machine Information and Site Details sections
    {
      type: "double",
      title: {
        left: "Machine Information",
        right: "Site Details"
      },
      fields: {
        left: [
          { label: "Asset/ERP Code", value: entry.assetCode },
          { label: "Machine Name", value: entry.machineName },
          { label: "Registration No", value: entry.registrationNo },
          { label: "GST No.", value: "21AABCT4589R1ZP" }
        ],
        right: [
          { label: "Site Name", value: entry.siteName },
          { label: "Location", value: entry.location },
          { label: "Contact", value: "SUKUMAR SAHU" }
        ]
      }
    },
    // Note section
    {
      children: (
        <View style={{ borderWidth: 1, borderColor: "#000", padding: 8, marginBottom: 10, backgroundColor: "#f0f0f0" }}>
          <Text style={{ fontStyle: "italic" }}>
            This logbook entry records the daily machine performance and diesel 
            consumption for maintenance and efficiency tracking purposes.
          </Text>
          <Text style={{ fontStyle: "italic" }}>
            All readings should be verified and recorded accurately by the operator.
          </Text>
        </View>
      )
    },
    // Working details section
    {
      children: (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Working Details:</Text>
          <Text>{entry.workingDetail || "No working details provided."}</Text>
        </View>
      )
    }
  ];

  // Build tables
  const dieselConsumptionTable = {
    headers: ["Opening Balance (L)", "Diesel Issue (L)", "Closing Balance (L)", "Diesel Used (L)"],
    widths: ["25%", "25%", "25%"],
    data: [
      [entry.dieselOpeningBalance.toString(), entry.dieselIssue.toString(), entry.dieselClosingBalance.toString(), dieselUsed.toString()]
    ]
  };

  const performanceMetricsTable = {
    headers: ["KM Reading (Start)", "KM Reading (End)", "Total KM Run", "Diesel Efficiency (KM/L)", "Diesel Used (L)"],
    widths: ["20%", "20%", "20%"],
    data: [
      [entry.openingKMReading.toString(), entry.closingKMReading.toString(), entry.totalRunKM.toString(), entry.dieselAvgKM.toString(), dieselUsed.toString()]
    ]
  };

  const hoursMeterTable = {
    headers: ["Hours Meter (Start)", "Hours Meter (End)", "Total Hours Run", "Diesel per Hour (L/Hr)", "Diesel Used (L)"],
    widths: ["20%", "20%", "20%", "20%"],
    data: [
      [entry.openingHrsMeter.toString(), entry.closingHrsMeter.toString(), entry.totalRunHrsMeter.toString(), entry.dieselAvgHrsMeter.toString(), dieselUsed.toString()]
    ]
  };

  // Build footer configuration
  const footerConfig = {
    signatureBlocks: [
      { label: "Operator", value: "Name & Sign" },
      { label: "Supervisor", value: "Name & Sign" },
      { label: "Site Engineer", value: "Name & Sign" }
    ]
  };

  // Configuration for the dynamic PDF
  const config = {
    title: "MACHINE LOGBOOK ENTRY",
    dateInfo: dateInfo,
    sections: sections,
    tables: [dieselConsumptionTable, performanceMetricsTable, hoursMeterTable],
    footerConfig: footerConfig
  };

  return <DynamicPDF config={config} data={entry} />;
};

export default LogbookPDF;

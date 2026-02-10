import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Register font
Font.register({
  family: "Open Sans",
  src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Open Sans",
    fontSize: 11,
    paddingTop: 20,
    paddingLeft: 30,
    paddingRight: 30,
    lineHeight: 1.5,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "6%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "6%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 10,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  summaryCell: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  itemDescriptionCell: {
    fontSize: 10,
    textAlign: "left",
  },
  vendorCell: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "gray",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 10,
    width: "45%",
  },
  infoLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoValue: {
    marginBottom: 3,
  },
});

const QuotationComparisonPDF = ({ comparison }) => {
  if (!comparison) return null;

  const { items, vendors, requisition } = comparison;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text>Quotation Comparison Report</Text>
          <Text>{format(new Date(), "dd/MM/yyyy")}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>QUOTATION COMPARISON REPORT</Text>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Comparison Details</Text>
            <Text style={styles.infoValue}>
              Comparison No: {comparison.comparisonNo}
            </Text>
            <Text style={styles.infoValue}>
              Status: {comparison.status.toUpperCase()}
            </Text>
            <Text style={styles.infoValue}>
              Created: {format(new Date(comparison.createdAt), "dd/MM/yyyy")}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Requisition Details</Text>
            <Text style={styles.infoValue}>
              Requisition No: {requisition?.requisitionNo || "N/A"}
            </Text>
            <Text style={styles.infoValue}>
              Site: {requisition?.requestingSite?.name || "N/A"}
            </Text>
            <Text style={styles.infoValue}>
              Requested:{" "}
              {requisition?.requestedAt
                ? format(new Date(requisition.requestedAt), "dd/MM/yyyy")
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Vendor Comparison Table */}
        <View style={styles.section}>
          <Text style={styles.heading}>Vendor Comparison</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>SI No</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Item Description</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Unit</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Qty</Text>
              </View>
              {vendors.map((vendor) => [
                <View key={`${vendor.vendor.id}-rate`} style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>{vendor.vendor.name}</Text>
                  <Text style={styles.tableCellHeader}>Rate</Text>
                </View>,
                <View key={`${vendor.vendor.id}-amount`} style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}> </Text>
                  <Text style={styles.tableCellHeader}>Amount</Text>
                </View>
              ])}
            </View>

            {/* Table Rows */}
            {items.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.itemDescriptionCell}>
                    {item.description}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.unit}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                </View>

                {vendors.map((vendor) => {
                  const rate = item.rates
                    ? item.rates.find((r) => r.vendor.id === vendor.vendorId)
                    : null;
                  return [
                    <View key={`${vendor.id}-rate`} style={styles.tableCol}>
                      {rate ? (
                        <Text style={styles.tableCell}>
                          ₹{rate.rate}
                        </Text>
                      ) : (
                        <Text style={styles.tableCell}>-</Text>
                      )}
                    </View>,
                    <View key={`${vendor.vendor.id}-amount`} style={styles.tableCol}>
                      {rate ? (
                        <Text style={styles.tableCell}>
                          ₹{rate.amount}
                        </Text>
                      ) : (
                        <Text style={styles.tableCell}>-</Text>
                      )}
                    </View>
                  ];
                })}
              </View>
            ))}

            {/* Grand Total Row */}
            <View style={[styles.tableRow, styles.summaryRow]}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Total</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Grand Total</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>-</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>-</Text>
              </View>
              {vendors.map((vendor) => [
                <View key={`${vendor.id}-rate-total`} style={styles.tableColHeader}>
                  <Text style={styles.summaryCell}>-</Text>
                </View>,
                <View key={`${vendor.id}-amount-total`} style={styles.tableColHeader}>
                  <Text style={styles.summaryCell}>₹{vendor.totalAmount}</Text>
                </View>
              ])}
            </View>
          </View>
        </View>

        {/* Vendor Analysis */}
        <View style={styles.section}>
          <Text style={styles.heading}>Vendor Analysis</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Vendor</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Total Amount</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Status</Text>
              </View>
            </View>

            {vendors.map((vendor) => (
              <View key={vendor.id} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.vendorCell}>{vendor.vendor.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>₹{vendor.totalAmount}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>Active</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default QuotationComparisonPDF;

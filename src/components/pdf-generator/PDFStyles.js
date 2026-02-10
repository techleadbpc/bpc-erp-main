import { StyleSheet } from "@react-pdf/renderer";

// Centralized styles for all PDF components
const PDFStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  pageWithMorePadding: {
    padding: 40,
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companyInfo: {
    width: "60%",
  },
  companyInfoNarrow: {
    width: "50%",
  },
  locationInfo: {
    width: "50%",
    textAlign: "right",
  },
  companyName: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  companyAddress: {
    marginBottom: 1,
  },
  dateInfo: {
    width: "40%",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    textDecoration: "underline",
  },
  titleSmall: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  sectionContainer: {
    flexDirection: "row",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  section: {
    width: "50%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  sectionRight: {
    width: "50%",
    padding: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
  },
  labelNarrow: {
    width: "35%",
    fontWeight: "bold",
  },
  value: {
    width: "60%",
  },
  valueWide: {
    width: "65%",
  },
  noteBox: {
    borderWidth: 1,
    borderColor: "#00",
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  noteText: {
    fontStyle: "italic",
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRowLast: {
    flexDirection: "row",
  },
 tableRowNoBorder: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  },
  tableColHeaderLeft: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    textAlign: "left",
  },
  tableColHeaderLast: {
    padding: 5,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    textAlign: "center",
  },
  tableColLeft: {
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    textAlign: "left",
  },
  tableColLast: {
    padding: 5,
    textAlign: "center",
  },
  tableColLastLeft: {
    padding: 5,
    textAlign: "left",
  },
 totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#000",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signature: {
    width: "30%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    textAlign: "center",
  },
  signatureSmall: {
    width: "18%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 5,
    textAlign: "center",
    fontSize: 7,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "25%",
    opacity: 0.05,
    transform: "rotate(-30deg)",
    fontSize: 100,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  detailLabel: {
    width: "35%",
    fontWeight: "bold",
  },
  detailValue: {
    width: "65%",
  },
  boldText: {
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#cccccc",
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 30,
  },
  signatureLine: {
    width: 200,
    borderBottom: "1px solid #0000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  colLabel: {
    width: "30%",
  },
  colValue: {
    width: "70%",
  },
  colFixed: {
    width: "50%",
  },
  pendingText: {
    fontWeight: "bold",
  },
  statusText: {
    fontWeight: "bold",
  },
});

export default PDFStyles;

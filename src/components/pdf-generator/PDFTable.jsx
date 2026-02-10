import React from "react";
import { Text, View } from "@react-pdf/renderer";
import PDFStyles from "./PDFStyles";

const PDFTable = ({
  headers = [],
  data = [],
  widths = [],
  showTotal = false,
  totalRow = null,
  customHeaderStyle = null,
  customRowStyle = null,
  customCellStyle = null,
  customTotalStyle = null
}) => {
  return (
    <View style={PDFStyles.table}>
      {/* Table Header */}
      <View style={PDFStyles.tableRow}>
        {headers.map((header, index) => (
          <View
            key={index}
            style={[
              index === headers.length - 1 ? PDFStyles.tableColHeaderLast : PDFStyles.tableColHeader,
              customHeaderStyle,
              { width: widths[index] || `${100 / headers.length}%` }
            ]}
          >
            <Text>{header}</Text>
          </View>
        ))}
      </View>

      {/* Table Body */}
      {data.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            rowIndex === data.length - 1 ? PDFStyles.tableRowLast : PDFStyles.tableRow,
            customRowStyle
          ]}
        >
          {row.map((cell, cellIndex) => (
            <View
              key={cellIndex}
              style={[
                cellIndex === row.length - 1 ? PDFStyles.tableColLast : PDFStyles.tableCol,
                customCellStyle,
                { width: widths[cellIndex] || `${100 / row.length}%` }
              ]}
            >
              <Text>{cell}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Total Row */}
      {showTotal && totalRow && (
        <View style={[PDFStyles.totalRow, customTotalStyle]}>
          {totalRow.map((cell, index) => (
            <View
              key={index}
              style={[
                index === totalRow.length - 1 ? PDFStyles.tableColLast : PDFStyles.tableCol,
                { width: widths[index] || `${100 / totalRow.length}%` }
              ]}
            >
              <Text>{cell}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PDFTable;

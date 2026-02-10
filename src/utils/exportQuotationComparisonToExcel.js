import { utils, writeFile } from 'xlsx-js-style';

const exportQuotationComparisonToExcel = (comparison) => {
  if (!comparison) {
    console.error('No comparison data provided');
    return;
  }

  try {
    const { items, vendors, comparisonNo, status, createdAt, requisition } = comparison;

    // Define reusable styles
    const styles = {
      title: {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { patternType: "solid", fgColor: { rgb: "1F4788" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      },
      sectionHeader: {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { patternType: "solid", fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      },
      vendorHeader: {
        font: { bold: true, sz: 11, color: { rgb: "000000" } },
        fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      },
      tableHeader: {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { patternType: "solid", fgColor: { rgb: "2E5090" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      },
      dataCell: {
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      },
      dataCellAlt: {
        fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      },
      numberCell: {
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "#,##0.00",
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      },
      numberCellAlt: {
        fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "#,##0.00",
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      },
      totalRow: {
        font: { bold: true, sz: 11 },
        fill: { patternType: "solid", fgColor: { rgb: "FFC000" } },
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "#,##0.00",
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      },
      infoLabel: {
        font: { bold: true, sz: 10 },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      },
      infoValue: {
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      }
    };

    // Create worksheet data
    const wsData = [];
    const merges = [];

    // Add title
    wsData.push([{ v: 'QUOTATION COMPARISON REPORT', s: styles.title }]);
    wsData.push([]);

    // Add comparison details
    wsData.push([{ v: 'Comparison Details', s: styles.sectionHeader }]);
    wsData.push([
      { v: 'Comparison No:', s: styles.infoLabel },
      { v: comparisonNo, s: styles.infoValue }
    ]);
    wsData.push([
      { v: 'Status:', s: styles.infoLabel },
      { v: status.toUpperCase(), s: styles.infoValue }
    ]);
    wsData.push([
      { v: 'Created:', s: styles.infoLabel },
      { v: new Date(createdAt).toLocaleDateString(), s: styles.infoValue }
    ]);
    wsData.push([]);

    // Add requisition details
    wsData.push([{ v: 'Requisition Details', s: styles.sectionHeader }]);
    wsData.push([
      { v: 'Requisition No:', s: styles.infoLabel },
      { v: requisition?.requisitionNo || 'N/A', s: styles.infoValue }
    ]);
    wsData.push([
      { v: 'Site:', s: styles.infoLabel },
      { v: requisition?.requestingSite?.name || 'N/A', s: styles.infoValue }
    ]);
    if (requisition?.requestedAt) {
      wsData.push([
        { v: 'Requested:', s: styles.infoLabel },
        { v: new Date(requisition.requestedAt).toLocaleDateString(), s: styles.infoValue }
      ]);
    }
    wsData.push([]);

    // Store the header row indices
    const vendorHeaderRowIndex = wsData.length;
    const columnHeaderRowIndex = wsData.length + 1;

    // First header row - Vendor names (merged across Rate and Amount columns)
    const vendorHeaderRow = [
      { v: '', s: styles.vendorHeader }, // SI No
      { v: '', s: styles.vendorHeader }, // Item Description
      { v: '', s: styles.vendorHeader }, // Unit
      { v: '', s: styles.vendorHeader }  // Qty
    ];
    
    let currentCol = 4; // Start after the first 4 columns
    vendors.forEach((vendor) => {
      vendorHeaderRow.push({ v: vendor.vendor.name, s: styles.vendorHeader });
      vendorHeaderRow.push({ v: '', s: styles.vendorHeader }); // Second column for merge
      
      // Add merge for vendor name spanning Rate and Amount columns
      merges.push({
        s: { r: vendorHeaderRowIndex, c: currentCol },
        e: { r: vendorHeaderRowIndex, c: currentCol + 1 }
      });
      
      currentCol += 2;
    });
    
    wsData.push(vendorHeaderRow);

    // Second header row - Column names (SI No, Item Description, Unit, Qty, Rate, Amount for each vendor)
    const columnHeaderRow = [
      { v: 'SI No', s: styles.tableHeader },
      { v: 'Item Description', s: styles.tableHeader },
      { v: 'Unit', s: styles.tableHeader },
      { v: 'Qty', s: styles.tableHeader }
    ];
    
    vendors.forEach(() => {
      columnHeaderRow.push({ v: 'Rate', s: styles.tableHeader });
      columnHeaderRow.push({ v: 'Amount', s: styles.tableHeader });
    });
    
    wsData.push(columnHeaderRow);

    // Add data rows with alternating row colors
    items.forEach((item, index) => {
      const isAltRow = index % 2 === 1;
      const cellStyle = isAltRow ? styles.dataCellAlt : styles.dataCell;
      const numStyle = isAltRow ? styles.numberCellAlt : styles.numberCell;

      const row = [
        { v: index + 1, s: cellStyle },
        { v: item.description, s: cellStyle },
        { v: item.unit, s: cellStyle },
        { v: item.quantity, s: numStyle }
      ];

      vendors.forEach(vendor => {
        const rate = item.rates?.find(r => r.vendor.id === vendor.vendorId);
        if (rate) {
          row.push({ v: rate.rate, s: numStyle });
          row.push({ v: rate.amount, s: numStyle });
        } else {
          row.push({ v: '-', s: cellStyle });
          row.push({ v: '-', s: cellStyle });
        }
      });

      wsData.push(row);
    });

    // Add grand total row
    wsData.push([]);
    const totalRow = [
      { v: 'Grand Total', s: styles.totalRow },
      { v: '', s: styles.totalRow },
      { v: '', s: styles.totalRow },
      { v: '', s: styles.totalRow }
    ];
    
    vendors.forEach(vendor => {
      totalRow.push({ v: '', s: styles.totalRow }); // Rate column
      totalRow.push({ v: vendor.totalAmount, s: styles.totalRow }); // Amount column
    });
    
    wsData.push(totalRow);

    // Create worksheet
    const ws = utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 8 },  // SI No
      { wch: 40 }, // Item Description
      { wch: 10 }, // Unit
      { wch: 8 }   // Qty
    ];
    
    // Add widths for vendor columns
    vendors.forEach(() => {
      colWidths.push({ wch: 15 }); // Rate
      colWidths.push({ wch: 15 }); // Amount
    });
    
    ws['!cols'] = colWidths;

    // Set row heights
    const rowHeights = [];
    wsData.forEach((row, index) => {
      if (index === 0) {
        rowHeights.push({ hpt: 30 }); // Title row
      } else if (index === vendorHeaderRowIndex || index === columnHeaderRowIndex) {
        rowHeights.push({ hpt: 25 }); // Header rows
      } else {
        rowHeights.push({ hpt: 20 }); // Default row height
      }
    });
    ws['!rows'] = rowHeights;

    // Add merge for title
    merges.unshift({
      s: { r: 0, c: 0 },
      e: { r: 0, c: 3 + (vendors.length * 2) }
    });

    // Apply all merges
    ws['!merges'] = merges;

    // Create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Quotation Comparison');

    // Write file
    const fileName = `Quotation-Comparison-${comparisonNo}.xlsx`;
    writeFile(wb, fileName);
    
    console.log(`Excel file exported successfully: ${fileName}`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel. Please try again.');
  }
};

export default exportQuotationComparisonToExcel;

# Dynamic PDF Generator System

This system provides a reusable and maintainable approach to generating PDFs in the application. Instead of hardcoding repetitive elements in each PDF component, this system uses configurable components that can be reused across different PDF types.

## Components

### PDFHeader
Renders the standard header with company information and title.

**Props:**
- `title`: The title of the PDF
- `dateInfo`: Array of objects with label/value pairs for date info (e.g., `[ { label: "Date", value: "2023-01-01" } ]`)
- `showCompanyInfo`: Whether to show company information (default: true)
- `showLogo`: Whether to show the company logo (default: false)
- `customCompanyInfo`: Override the default company information
- `additionalInfo`: Additional JSX to render in the header

### PDFFooter
Renders the standard footer with signature blocks.

**Props:**
- `signatureBlocks`: Array of objects with label/value pairs for signature blocks
- `showDivider`: Whether to show a divider before the footer (default: false)
- `customStyle`: Custom style for the footer container
- `watermark`: Optional watermark text

### PDFTable
Renders a standard table with headers and data.

**Props:**
- `headers`: Array of header labels
- `data`: Array of arrays containing the table data
- `widths`: Array of column widths (optional)
- `showTotal`: Whether to show a total row (default: false)
- `totalRow`: Array containing the total row data (required if showTotal is true)

### PDFSection
Renders a section with optional fields and content.

**Props:**
- `title`: Section title
- `sectionType`: Type of section ('default', 'double', 'single')
- `fields`: Array of field objects with label/value pairs (for 'single' type)
- `showBorder`: Whether to show a border around the section (default: true)
- `children`: Additional content to render in the section

### DynamicPDF
Main component that combines all other components to create a complete PDF.

**Props:**
- `config`: Configuration object with the following properties:
 - `title`: PDF title
  - `companyInfo`: Custom company information (optional)
  - `showLogo`: Whether to show the logo (default: false)
  - `dateInfo`: Array of date info objects
  - `headerAdditionalInfo`: Additional header content
  - `sections`: Array of section configurations
  - `tables`: Array of table configurations
  - `footerConfig`: Footer configuration object
  - `watermark`: Watermark text (optional)
  - `pageStyle`: Style for the page ('page' or 'pageWithMorePadding', default: 'page')
- `data`: Data to be used in the PDF

## Utility Functions

### formatDate(dateString)
Formats a date string to 'dd-MMM-yyyy' format using date-fns.

### formatCurrency(amount)
Formats a number as Indian currency with ₹ symbol.

## Usage Example

```jsx
import { DynamicPDF, formatDate } from "./components/pdf-generator";

const ExamplePDF = ({ data }) => {
  // Build configuration
  const config = {
    title: "Example PDF",
    dateInfo: [
      { label: "Date", value: formatDate(data.date) }
    ],
    sections: [
      {
        type: "double", // Creates a two-column section
        title: {
          left: "From",
          right: "To"
        },
        fields: {
          left: [
            { label: "Name", value: data.fromName }
          ],
          right: [
            { label: "Name", value: data.toName }
          ]
        }
      }
    ],
    tables: [
      {
        headers: ["Item", "Quantity"],
        widths: ["50%", "50%"],
        data: [
          ["Item 1", "10"],
          ["Item 2", "20"]
        ],
        showTotal: true,
        totalRow: ["Total", "30"]
      }
    ],
    footerConfig: {
      signatureBlocks: [
        { label: "Prepared By", value: data.preparedBy },
        { label: "Approved By", value: data.approvedBy }
      ]
    }
  };

  return <DynamicPDF config={config} data={data} />;
};
```

## Benefits

1. **Reduced Code Duplication**: Common elements like headers, footers, and tables are now in reusable components.
2. **Easier Maintenance**: Changes to common elements only need to be made in one place.
3. **Consistent Styling**: All PDFs now use the same styling for common elements.
4. **Flexible Configuration**: Each PDF can be customized through configuration objects.
5. **Scalability**: New PDF types can be created quickly using the existing components.

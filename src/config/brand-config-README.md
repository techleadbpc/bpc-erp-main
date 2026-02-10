# Brand Configuration System

This system provides a centralized way to manage all branding information throughout the application. Any changes to the brand configuration will automatically propagate throughout the entire application, including PDF documents.

## Configuration Structure

The brand configuration is organized into several sections:

### Company Information
- `name`: Company name
- `addressLine1`: First line of address
- `addressLine2`: Second line of address
- `contact`: Contact information
- `email`: Company email
- `website`: Company website

### Legal Information
- `gstNo`: GST number
- `panNo`: PAN number
- `registrationNo`: Registration number

### Brand Colors
- `primary`, `secondary`, `accent`, etc.: Color definitions for UI elements

### Typography
- Font families and weights for different text elements

### Assets
- `logo`: Path to company logo
- `favicon`: Path to favicon

### Default Contact
- Default contact person information

### Default GST Numbers
- Default GST numbers for different contexts

## Usage

### In React Components
```jsx
import { useBrand } from '../contexts/BrandContext';

function MyComponent() {
  const { getCompanyInfo, getLegalInfo } = useBrand();
  const companyInfo = getCompanyInfo();
  
  return (
    <div>
      <h1>{companyInfo.name}</h1>
      <p>{companyInfo.addressLine1}</p>
    </div>
  );
}
```

### Using the BrandInfo Component
```jsx
import BrandInfo from '../components/common/BrandInfo';

function MyComponent() {
  return (
    <BrandInfo 
      showName={true} 
      showAddress={true} 
      showContact={false}
      variant="default" 
    />
  );
}
```

### Updating Brand Information
```jsx
import { useBrand } from '../contexts/BrandContext';

function UpdateBrand() {
  const { updateBrandSection } = useBrand();
  
  const handleUpdate = () => {
    updateBrandSection('company', {
      name: 'New Company Name',
      addressLine1: 'New Address Line 1'
    });
  };
  
  return <button onClick={handleUpdate}>Update Brand</button>;
}
```

## PDF Integration

All PDF components now use the centralized brand configuration:

- PDFHeader automatically uses company information
- PDF sections can access brand information via context
- The DynamicPDF component has access to all brand information

## Benefits

1. **Centralized Management**: All branding information is in one place
2. **Consistency**: Brand information is consistent throughout the application
3. **Easy Updates**: Change brand information in one place to update the entire app
4. **PDF Integration**: Brand changes automatically reflect in all generated PDFs
5. **Context Provider**: Real-time updates throughout the application
6. **Reusable Components**: BrandInfo component for consistent display

## File Locations

- `frontend/src/config/brand-config.js`: Main configuration file
- `frontend/src/contexts/BrandContext.jsx`: Context provider
- `frontend/src/components/common/BrandInfo.jsx`: Reusable brand display component
- `frontend/src/utils/brand-utils.js`: Utility functions for brand management

// Example using jsPDF (you'll need to install it)
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const handleDownload = async () => {
  const element = challanRef.current
  const canvas = await html2canvas(element)
  const data = canvas.toDataURL('image/png')
  
  const pdf = new jsPDF()
  const imgProperties = pdf.getImageProperties(data)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width
  
  pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(`transfer-challan-${transfer.id}.pdf`)
}
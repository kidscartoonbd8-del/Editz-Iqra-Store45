import { jsPDF } from 'jspdf';
import { Download, CheckCircle, FileText } from 'lucide-react';
import { Order } from '../types';

interface ReceiptDownloaderProps {
  order: Order;
  buttonClassName?: string;
}

export default function ReceiptDownloader({ order, buttonClassName }: ReceiptDownloaderProps) {
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Color Palette
    const primaryColor = [15, 23, 42]; // Slate 900
    const secondaryColor = [79, 70, 229]; // Indigo 600
    const accentColor = [139, 92, 246]; // Purple 500
    const darkText = [30, 41, 59]; // Slate 800
    const lightText = [100, 116, 139]; // Slate 500
    const successColor = [16, 185, 129]; // Emerald 500

    // Background Accent Bar
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 8, 'F');

    // Header Logo & Brand
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Editz Iqra', 20, 25);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text('Premium Learning & Digital Products Platform', 20, 30);
    doc.text('https://editz-iqra.com', 20, 34);

    // Invoice Meta (Right-aligned)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('OFFICIAL RECEIPT', 140, 25);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(`Receipt No: EI-${order.id.split('-')[1] || '0000'}`, 140, 32);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString('bn-BD')}`, 140, 37);

    // Divider Line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(20, 43, 190, 43);

    // Bill To Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('BILL TO:', 20, 52);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(order.customerName, 20, 58);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text(`Phone: ${order.phone}`, 20, 64);
    if (order.email) {
      doc.text(`Email: ${order.email}`, 20, 70);
    }

    // Payment Info Section (Right column)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PAYMENT DETAILS:', 120, 52);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(`Method: ${order.paymentMethod}`, 120, 58);
    doc.text(`Transaction ID: ${order.transactionId}`, 120, 64);
    
    // Status Badge
    doc.setFillColor(209, 250, 229); // Light emerald bg
    doc.rect(120, 68, 35, 6, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.text(`STATUS: ${order.status.toUpperCase()}`, 122, 72.5);

    // Items Header Table
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(20, 83, 170, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('PRODUCT / COURSE NAME', 24, 88);
    doc.text('TOTAL AMOUNT', 150, 88);

    // Item Table Row
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(order.productName, 24, 101);
    
    doc.setFont('Helvetica', 'bold');
    doc.text(`${order.amount.toLocaleString()} BDT`, 150, 101);

    // Table Underline
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 107, 190, 107);

    // Subtotal and Total section
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text('Subtotal:', 125, 116);
    doc.text('Vat/Tax (0%):', 125, 122);
    
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Paid Total:', 125, 130);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(`${order.amount.toLocaleString()} BDT`, 160, 116);
    doc.text('0 BDT', 160, 122);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${order.amount.toLocaleString()} BDT`, 160, 130);

    // Terms & Support
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Thank you for choosing Editz Iqra!', 20, 160);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text('• Access credentials and guidelines will be shared via your contact phone/email.', 20, 166);
    doc.text('• For urgent queries, contact support at editz.iqra@gmail.com.', 20, 171);

    // Signature/Verification Placeholder
    doc.setDrawColor(226, 232, 240);
    doc.line(130, 175, 180, 175);
    doc.setFontSize(8);
    doc.text('Authorized Signature', 140, 179);

    // Stamp circle
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(1);
    doc.circle(155, 160, 10);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('EDITZ IQRA', 149, 159);
    doc.text('VERIFIED', 151, 162);

    // Trigger Download
    doc.save(`Receipt_Editz_Iqra_${order.id}.pdf`);
  };

  return (
    <button
      onClick={downloadPDF}
      className={buttonClassName || "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-violet-900/30 transition duration-300 transform active:scale-95 text-sm"}
    >
      <Download className="w-4 h-4" />
      <span>রশিদ ডাউনলোড করুন (Receipt)</span>
    </button>
  );
}

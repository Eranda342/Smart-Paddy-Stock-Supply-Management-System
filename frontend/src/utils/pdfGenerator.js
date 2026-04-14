// frontend/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUrl from '../assets/navbar.svg';

const getLogoBase64 = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = logoUrl;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 200;
      canvas.height = img.height || 200;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
  });
};

const runAutoTable = (doc, options) => {
  if (typeof autoTable === 'function') {
    return autoTable(doc, options);
  } else if (autoTable && typeof autoTable.default === 'function') {
    return autoTable.default(doc, options);
  } else if (typeof doc.autoTable === 'function') {
    return doc.autoTable(options);
  }
};

export const generateReportPDF = async ({
  data,
  startDate,
  endDate,
  range,
  chartBase64,
  forEmail = false
}) => {
  const {
    overview,
    conversion,
    revenueData,
    usersData,
    paddyData,
    districtData,
    transactionsRaw,
  } = data;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ENTERPRISE BRANDING COLORS
  const HEADER_BG = [11, 15, 25]; // #0B0F19 (Dark Navy)
  const SUBHEADER_BG = [243, 244, 246]; // #F3F4F6
  const SUBHEADER_TEXT = [107, 114, 128]; // #6B7280
  const TABLE_HEAD_BG = [17, 24, 39]; // #111827
  const CARD_BG = [245, 247, 250]; // #F5F7FA
  const TEXT_DARK = [17, 24, 39];
  const WHITE = [255, 255, 255];

  const avgTxnValueCalc = overview.totalTransactions > 0
    ? Math.round(overview.totalRevenue / overview.totalTransactions) : 0;
  
  const deliveryRateCalc = overview.totalTransactions > 0
    ? ((overview.completedDeliveries / overview.totalTransactions) * 100).toFixed(1) : '0.0';
  
  const topPaddyCalc = paddyData.length > 0
    ? [...paddyData].sort((a, b) => b.value - a.value)[0].name : '—';
  
  const topDistrictCalc = districtData.length > 0
    ? [...districtData].sort((a, b) => b.value - a.value)[0].name : '—';
  
  const generatedAt = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const sysLogo = await getLogoBase64();

  const addHeader = (title) => {
    // Top Main Header
    doc.setFillColor(HEADER_BG[0], HEADER_BG[1], HEADER_BG[2]);
    doc.rect(0, 0, pageW, 22, 'F');
    
    // Logo and Platform Name
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    if (sysLogo) {
      doc.addImage(sysLogo, 'PNG', 14, 6, 10, 10);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AgroBridge', 28, 14);
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AgroBridge', 14, 14);
    }

    // Page title (Right side)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(title, pageW - 14, 14, { align: 'right' });

    // Sub-header (Thin row)
    doc.setFillColor(SUBHEADER_BG[0], SUBHEADER_BG[1], SUBHEADER_BG[2]);
    doc.rect(0, 22, pageW, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(SUBHEADER_TEXT[0], SUBHEADER_TEXT[1], SUBHEADER_TEXT[2]);
    doc.text(`Generated: ${generatedAt}`, 14, 27.5);
    doc.text('ADMIN PORTAL • CONFIDENTIAL', pageW - 14, 27.5, { align: 'right' });
  };

  const addFooter = (pageNum, totalPages) => {
    doc.setFontSize(8);
    doc.setTextColor(SUBHEADER_TEXT[0], SUBHEADER_TEXT[1], SUBHEADER_TEXT[2]);
    doc.text('AgroBridge • Smart Paddy Marketplace', 14, pageH - 8);
    doc.text(`Page 1 of 1`, pageW - 14, pageH - 8, { align: 'right' }); // Will be replaced globally if using generic method
  };

  // ───────────────────────────────────────────────────────────────────────
  // PAGE 1 — Executive Summary & Visuals
  // ───────────────────────────────────────────────────────────────────────
  addHeader('Platform Analytics Report');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('Executive Summary', 14, 40);

  // Executive Metric Cards Configuration
  const kpis = [
    { label: 'Total Revenue', value: `Rs ${overview.totalRevenue.toLocaleString()}` },
    { label: 'Transactions', value: overview.totalTransactions.toLocaleString() },
    { label: 'Users', value: overview.totalUsers.toLocaleString() },
    { label: 'Listings', value: overview.totalListings.toLocaleString() },
    { label: 'Conversion Rate', value: `${conversion.rate}%` },
    { label: 'Deliveries', value: overview.completedDeliveries.toLocaleString() },
    { label: 'Avg Transaction', value: `Rs ${avgTxnValueCalc.toLocaleString()}` },
    { label: 'Delivery Success', value: `${deliveryRateCalc}%` }
  ];

  const colW = (pageW - 40) / 4; 
  const rowH = 18;
  const startY = 46;

  kpis.forEach((kpi, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 14 + col * (colW + 4);
    const y = startY + row * (rowH + 4);

    // Card background
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
    doc.roundedRect(x, y, colW, rowH, 2, 2, 'F');
    
    // Label (Top Left)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(SUBHEADER_TEXT[0], SUBHEADER_TEXT[1], SUBHEADER_TEXT[2]);
    doc.text(kpi.label, x + 4, y + 6);
    
    // Bold Value (Bottom Left)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.text(kpi.value, x + 4, y + 14);
  });

  const insightY = startY + 2 * (rowH + 4) + 8;
  
  // ─── Key Insights Table ──────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('Key Insights', 14, insightY);

  const tableStartY = insightY + 6;
  runAutoTable(doc, {
    startY: tableStartY,
    head: [['Metric', 'Value']],
    body: [
      ['Top Paddy Variety', topPaddyCalc],
      ['Top District', topDistrictCalc],
      ['Accepted Negotiations', String(conversion.acceptedNegotiations || 0)],
      ['Avg Transaction Value', `Rs ${avgTxnValueCalc.toLocaleString()}`],
      ['Delivery Success Rate', `${deliveryRateCalc}%`]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3.5, textColor: TEXT_DARK },
    headStyles: {
      fillColor: TABLE_HEAD_BG,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: CARD_BG },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 100 },
    },
    margin: { left: 14, right: 14 },
  });

  let nextY = doc.lastAutoTable.finalY + 12;

  // ─── Chart Visuals Processing ──────────────────────────────────────────
  if (chartBase64) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.text('Revenue & Growth Analytics', 14, nextY);
    
    try {
      const imgProps = doc.getImageProperties(chartBase64);
      const maxWidth = pageW - 28;
      const maxHeight = pageH - nextY - 14; 
      
      let imgWidth = maxWidth;
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = (imgProps.width * imgHeight) / imgProps.height;
      }
      
      const xOffset = (pageW - imgWidth) / 2;
      doc.addImage(chartBase64, 'PNG', xOffset, nextY + 4, imgWidth, imgHeight);
    } catch(err) {
      console.warn("Chart embed skipped safely due to processing error");
    }
  }

  // ─── PAGE 2 — Transaction Register ──────────────────────────────────────
  doc.addPage();
  addHeader('Transaction Register');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`All Transactions (${transactionsRaw.length} records)`, 14, 40);

  const txRows = transactionsRaw.map((t, i) => [
    i + 1,
    t.orderNumber || "—",
    new Date(t.createdAt).toLocaleDateString(),
    t.listing?.paddyType || "—",
    t.buyer?.fullName || t.millOwner?.fullName || "—",
    t.seller?.fullName || t.farmer?.fullName || "—",
    `${t.quantityKg || 0} kg`,
    `Rs ${(t.finalPricePerKg || t.price || 0).toLocaleString()}`,
    `Rs ${(t.totalAmount || t.totalPrice || 0).toLocaleString()}`,
    t.paymentStatus || "—",
    (t.status || "—").replace(/_/g, " "),
  ]);

  runAutoTable(doc, {
    startY: 44,
    head: [
      [
        "#",
        "Order No.",
        "Date",
        "Paddy",
        "Buyer",
        "Seller",
        "Qty",
        "Price/kg",
        "Total",
        "Payment",
        "Status",
      ],
    ],
    body: txRows,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 3, textColor: TEXT_DARK },
    headStyles: {
      fillColor: TABLE_HEAD_BG,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: CARD_BG },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 32 },
      5: { cellWidth: 32 },
      6: { cellWidth: 14, halign: "right" },
      7: { cellWidth: 20, halign: "right" },
      8: { cellWidth: 22, halign: "right" },
      9: { cellWidth: 16, halign: "center" },
      10: { cellWidth: 22, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  // Add global page footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(SUBHEADER_TEXT[0], SUBHEADER_TEXT[1], SUBHEADER_TEXT[2]);
    doc.text('AgroBridge • Smart Paddy Marketplace', 14, pageH - 8);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 8, { align: 'right' });
  }

  if (forEmail) {
    return doc.output('blob');
  }

  const filename = `AgroBridge_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return true;
};

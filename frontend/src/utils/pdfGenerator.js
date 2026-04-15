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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  chartImages,
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

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // EXACT BRANDING COLORS
  const DARK_NAVY = [15, 23, 42]; // #0f172a
  const GREEN = [34, 197, 94]; // #22c55e
  const LIGHT_GRAY = [241, 245, 249]; // #f1f5f9
  const TEXT_GRAY = [100, 116, 139]; // Subtle gray
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

  const addHeader = () => {
    // Dark navy top bar (#0f172a)
    doc.setFillColor(...DARK_NAVY);
    doc.rect(0, 0, W, 25, 'F');
    
    // Left: AgroBridge logo
    doc.setTextColor(...WHITE);
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

    // Right: Report title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...WHITE);
    doc.text('Platform Analytics Report', W - 14, 14, { align: 'right' });

    // Under it: thin green line
    doc.setFillColor(...GREEN);
    doc.rect(0, 25, W, 1.5, 'F');

    // Below header: Meta Info
    const fmtPdfDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" }) : '';
    let periodLabel = "All Time";
    if (startDate && endDate) {
      periodLabel = `${fmtPdfDate(startDate)} to ${fmtPdfDate(endDate)}`;
    } else if (range === "7d") {
      periodLabel = "Last 7 Days";
    } else if (range === "30d") {
      periodLabel = "Last 30 Days";
    }

    doc.setFontSize(9);
    doc.setTextColor(...TEXT_GRAY);
    doc.text(`Generated: ${generatedAt}`, 14, 34);
    doc.text(`Report Period: ${periodLabel}`, 14, 40);
    
    doc.text('Admin Portal • Confidential', W - 14, 34, { align: 'right' });

    return 50; // Next Y Position
  };

  const addSectionTitle = (title, currentY) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_NAVY);
    doc.text(title, 14, currentY);
    
    // Green underline divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(...GREEN);
    doc.line(14, currentY + 3, W - 14, currentY + 3);
    
    return currentY + 12; // 12mm spacing below
  };

  // ───────────────────────────────────────────────────────────────────────
  // PAGE 1 — Executive Summary & Visuals
  // ───────────────────────────────────────────────────────────────────────
  let currentY = addHeader();

  // Section 1: Executive Summary (3 cards per row)
  currentY = addSectionTitle('Executive Summary', currentY);

  const kpis = [
    { label: 'Total Revenue', value: `Rs ${overview.totalRevenue.toLocaleString()}` },
    { label: 'Transactions', value: overview.totalTransactions.toLocaleString() },
    { label: 'Total Users', value: overview.totalUsers.toLocaleString() },
    { label: 'Total Listings', value: overview.totalListings.toLocaleString() },
    { label: 'Conversion Rate', value: `${conversion.rate}%` },
    { label: 'Completed Deliveries', value: overview.completedDeliveries.toLocaleString() }
  ];

  const cols = 3;
  const colW = (W - 28 - (cols - 1) * 6) / cols; 
  const rowH = 22;

  kpis.forEach((kpi, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 14 + col * (colW + 6);
    const y = currentY + row * (rowH + 6);

    // Light gray cards (#f1f5f9)
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, colW, rowH, 2, 2, 'F');
    
    // Label (small text)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_GRAY);
    doc.text(kpi.label, x + 4, y + 6);
    
    // Value (BIG bold text)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_NAVY);
    doc.text(kpi.value, x + 4, y + 16);
  });

  currentY += (Math.ceil(kpis.length / cols) * (rowH + 6)) + 10; // Vertical spacing between sections (24-32px ~ 10-12mm)
  
  // Section 2: Key Insights
  currentY = addSectionTitle('Key Insights', currentY);

  runAutoTable(doc, {
    startY: currentY,
    head: [['Metric', 'Value']],
    body: [
      ['Top Paddy Variety', topPaddyCalc],
      ['Top District', topDistrictCalc],
      ['Avg Transaction Value', `Rs ${avgTxnValueCalc.toLocaleString()}`],
      ['Delivery Success Rate', `${deliveryRateCalc}%`]
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4, textColor: DARK_NAVY },
    headStyles: {
      fillColor: DARK_NAVY,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 100 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 16;

  // Section 3: Charts
  const drawChart = (title, chartData, currentY) => {
    if (!chartData) return currentY;
    
    // Chart height: 350px minimum translates to roughly 95mm
    const chartHeightTarget = 95;
    
    if (currentY + chartHeightTarget + 10 > H) {
      doc.addPage();
      currentY = addHeader();
    }

    currentY = addSectionTitle(title, currentY);

    try {
      const imgProps = doc.getImageProperties(chartData);
      const maxWidth = W - 28;
      
      let imgWidth = maxWidth;
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Force height to be large as requested
      if (imgHeight < chartHeightTarget) {
        imgHeight = chartHeightTarget;
      }
      
      // Center aligned
      const xOffset = (W - imgWidth) / 2;
      doc.addImage(chartData, 'PNG', xOffset, currentY, imgWidth, imgHeight);
      
      // Spacing below
      return currentY + imgHeight + 16;
    } catch(err) {
      console.warn(`Chart embed skipped for ${title}`, err);
      return currentY;
    }
  };

  if (chartImages) {
    currentY = drawChart('Revenue Trend', chartImages.revenue, currentY);
    currentY = drawChart('User Growth', chartImages.users, currentY);
  }

  // Section 4: Transactions Overview
  // Need a new page if list doesn't fit
  if (currentY + 60 > H) {
    doc.addPage();
    currentY = addHeader();
  } else {
    currentY += 4;
  }

  currentY = addSectionTitle('Transactions Overview', currentY);

  const txRows = transactionsRaw.map((t, i) => [
    i + 1,
    t.orderNumber?.slice(0, 8) || "—",
    new Date(t.createdAt).toLocaleDateString(),
    t.listing?.paddyType || "—",
    t.buyer?.fullName || t.millOwner?.fullName || "—",
    t.seller?.fullName || t.farmer?.fullName || "—",
    `${t.quantityKg || 0}kg`,
    `Rs ${(t.totalAmount || t.totalPrice || 0).toLocaleString()}`,
    (t.status || "—").replace(/_/g, " ").slice(0,12)
  ]);

  runAutoTable(doc, {
    startY: currentY,
    head: [
      [
        "#",
        "Order",
        "Date",
        "Paddy",
        "Buyer",
        "Seller",
        "Qty",
        "Total",
        "Status",
      ],
    ],
    body: txRows,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 3.5, textColor: DARK_NAVY },
    headStyles: {
      fillColor: DARK_NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 16 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { cellWidth: 24 },
      5: { cellWidth: 24 },
      6: { cellWidth: 14, halign: "right" },
      7: { cellWidth: 20, halign: "right" },
      8: { cellWidth: 22, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_GRAY);
    // Left
    doc.text('AgroBridge • Smart Paddy Marketplace', 14, H - 8);
    // Right
    doc.text(`Page ${i} of ${pageCount}`, W - 14, H - 8, { align: 'right' });
  }

  if (forEmail) {
    return doc.output('blob');
  }

  const filename = `AgroBridge_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return true;
};

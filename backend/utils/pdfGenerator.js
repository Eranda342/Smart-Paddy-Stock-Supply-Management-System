const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");

const generateReportPDF = ({ data, startDate, endDate, range }) => {
  const {
    overview,
    conversion,
    revenueData,
    usersData,
    paddyData,
    districtData,
    transactionsRaw,
  } = data || {};

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const GREEN = [34, 197, 94];
  const DARK = [15, 23, 42];
  const GRAY = [100, 116, 139];
  const WHITE = [255, 255, 255];
  const LIGHT = [241, 245, 249];

  const avgTxnValueCalc =
    overview && overview.totalTransactions > 0
      ? Math.round(overview.totalRevenue / overview.totalTransactions)
      : 0;
  const deliveryRateCalc =
    overview && overview.totalTransactions > 0
      ? ((overview.completedDeliveries / overview.totalTransactions) * 100).toFixed(1)
      : "0.0";
  const topPaddyCalc =
    paddyData && paddyData.length > 0
      ? [...paddyData].sort((a, b) => b.value - a.value)[0].name
      : "—";
  const topDistrictCalc =
    districtData && districtData.length > 0
      ? [...districtData].sort((a, b) => b.value - a.value)[0].name
      : "—";
  
  const generatedAt = new Date().toLocaleString("en-LK", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const addHeader = (title, subtitle) => {
    // Green header bar
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(0, 0, pageW, 22, "F");
    // Logo text
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AgroBridge", 10, 14);
    // Page title (right)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(title, pageW - 10, 14, { align: "right" });
    // Subtitle strip
    doc.setFillColor(DARK[0], DARK[1], DARK[2]);
    doc.rect(0, 22, pageW, 8, "F");
    doc.setFontSize(8);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(subtitle || `Generated: ${generatedAt}`, 10, 27.5);
    doc.text("ADMIN PORTAL  |  CONFIDENTIAL", pageW - 10, 27.5, {
      align: "right",
    });
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  };

  const addFooter = (pageNum, total) => {
    doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(`AgroBridge Analytics Report  •  ${generatedAt}`, 10, pageH - 3.5);
    doc.text(`Page ${pageNum} of ${total}`, pageW - 10, pageH - 3.5, {
      align: "right",
    });
  };

  // ───────────────────────────────────────────────────────────────────────
  // PAGE 1 — Executive Summary
  // ───────────────────────────────────────────────────────────────────────
  addHeader("Analytics Report", `Platform snapshot as of ${generatedAt}`);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Executive Summary", 10, 40);

  // KPI grid (2 rows × 4 cols)
  const kpis = [
    {
      label: "Total Revenue",
      value: `Rs ${overview ? overview.totalRevenue.toLocaleString() : 0}`,
      color: GREEN,
    },
    {
      label: "Total Transactions",
      value: overview ? overview.totalTransactions.toLocaleString() : "0",
      color: [59, 130, 246],
    },
    {
      label: "Total Users",
      value: overview ? overview.totalUsers.toLocaleString() : "0",
      color: [139, 92, 246],
    },
    {
      label: "Total Listings",
      value: overview ? overview.totalListings.toLocaleString() : "0",
      color: [245, 158, 11],
    },
    {
      label: "Conversion Rate",
      value: `${conversion ? conversion.rate : 0}%`,
      color: [99, 102, 241],
    },
    {
      label: "Completed Deliveries",
      value: overview ? overview.completedDeliveries.toLocaleString() : "0",
      color: [20, 184, 166],
    },
    {
      label: "Avg Transaction",
      value: `Rs ${avgTxnValueCalc.toLocaleString()}`,
      color: [236, 72, 153],
    },
    {
      label: "Delivery Success",
      value: `${deliveryRateCalc}%`,
      color: [239, 68, 68],
    },
  ];

  const colW = (pageW - 20) / 4;
  const rowH = 22;
  const startY = 45;

  kpis.forEach((kpi, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 10 + col * colW;
    const y = startY + row * (rowH + 4);

    doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.rect(x, y, colW - 2, rowH, "F");
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(x, y, 3, rowH, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(kpi.label, x + 7, y + 7);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text(kpi.value, x + 7, y + 16);
  });

  const insightY = startY + 2 * (rowH + 4) + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Key Insights", 10, insightY);

  const insightsTable = autoTable(doc, {
    startY: insightY + 4,
    head: [["Metric", "Value"]],
    body: [
      ["Top Paddy Variety", topPaddyCalc],
      ["Top District", topDistrictCalc],
      ["Accepted Negotiations", String(conversion ? conversion.acceptedNegotiations : 0)],
      ["Avg Transaction Value", `Rs ${avgTxnValueCalc.toLocaleString()}`],
      ["Delivery Success Rate", `${deliveryRateCalc}%`],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: GREEN,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { cellWidth: 80 },
    },
    margin: { left: 10, right: 10 },
  });

  if (revenueData && revenueData.length > 0) {
    const ry = (insightsTable?.finalY ?? doc.lastAutoTable?.finalY ?? insightY + 40) + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text("Revenue Trend (Last 6 Months)", 10, ry);
    autoTable(doc, {
      startY: ry + 4,
      head: [revenueData.map((r) => r.month)],
      body: [revenueData.map((r) => `Rs ${r.revenue.toLocaleString()}`)],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, halign: "center" },
      headStyles: { fillColor: DARK, textColor: WHITE, fontSize: 8 },
      margin: { left: 10, right: 10 },
    });
  }

  addFooter(1, 2);

  // ─── PAGE 2 — Transaction Register ──────────────────────────────────────
  doc.addPage();
  addHeader("Transaction Register");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text(`All Transactions  (${transactionsRaw ? transactionsRaw.length : 0} records)`, 10, 40);

  const txRows = (transactionsRaw || []).map((t, i) => [
    i + 1,
    t.orderNumber || "—",
    new Date(t.createdAt).toLocaleDateString(),
    t.listing?.paddyType || "—",
    t.millOwner?.fullName || "—",
    t.farmer?.fullName || "—",
    `${t.quantityKg || 0} kg`,
    `Rs ${(t.finalPricePerKg || 0).toLocaleString()}`,
    `Rs ${(t.totalAmount || 0).toLocaleString()}`,
    t.paymentStatus || "—",
    (t.status || "—").replace(/_/g, " "),
  ]);

  autoTable(doc, {
    startY: 44,
    head: [
      [
        "#",
        "Order No.",
        "Date",
        "Paddy",
        "Buyer (Mill)",
        "Seller (Farmer)",
        "Qty",
        "Price/kg",
        "Total",
        "Payment",
        "Status",
      ],
    ],
    body: txRows,
    theme: "striped",
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: {
      fillColor: GREEN,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
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
    margin: { left: 10, right: 10 },
  });

  addFooter(2, 2);

  return Buffer.from(doc.output("arraybuffer"));
};

module.exports = { generateReportPDF };

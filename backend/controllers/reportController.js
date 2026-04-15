const sendEmail = require('../utils/sendEmail');
const { generateReportPDF } = require('../utils/pdfGenerator');
const adminController = require('./adminController');

const executeController = (controller, req) => {
  return new Promise((resolve, reject) => {
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        if (this.statusCode && this.statusCode >= 400) {
          return reject(new Error(data.message || "Controller Error"));
        }
        resolve(data);
      }
    };
    try {
      controller(req, mockRes).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
};

const getReportData = async ({ userId, startDate, endDate, range, req }) => {
  if (req.user && req.user.role === 'ADMIN') {
    
    // BACKEND FIX: In the PDF generation controller, BEFORE generating report, apply filter
    // Pass the startDate and endDate into the requst query so the 'ONE source of truth' handles it perfectly
    req.query.startDate = startDate || null;
    req.query.endDate = endDate || null;
    req.query.range = range || "all";

    // Reuse existing admin analytics endpoints logic without duplicating aggregations
    // ALL exports use the SAME filtered dataset
    const [overview, conversion, revenueData, usersData, paddyData, districtData, txRes] = await Promise.all([
      executeController(adminController.getAnalyticsOverview, req),
      executeController(adminController.getAnalyticsConversion, req),
      executeController(adminController.getAnalyticsRevenue, req),
      executeController(adminController.getAnalyticsUsers, req),
      executeController(adminController.getAnalyticsPaddy, req),
      executeController(adminController.getAnalyticsDistricts, req),
      executeController(adminController.getAllTransactions, req)
    ]);

    return {
      overview,
      conversion,
      revenueData,
      usersData,
      paddyData,
      districtData,
      transactionsRaw: txRes.transactions || []
    };
  }
  
  // For Farmer/Mill Owner logic (if scaled in future)
  return {};
};

const emailReport = async (req, res) => {
  try {
    const { startDate, endDate, range, pdfBase64 } = req.body;
    
    let pdfBuffer;
    if (pdfBase64) {
      pdfBuffer = Buffer.from(pdfBase64, 'base64');
    } else {
      // Fallback Backend Generation
      const data = await getReportData({
        userId: req.user.id,
        startDate,
        endDate,
        range,
        req
      });
      pdfBuffer = generateReportPDF({ data, startDate, endDate, range });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #22C55E;">AgroBridge Report</h2>
        <p>Please find attached the requested report from the AgroBridge dashboard.</p>
        <p>Report Period: ${range === 'all' ? 'All Time' : (startDate && endDate ? `${startDate} to ${endDate}` : range || 'All Time')}</p>
        <br/>
        <p>Best regards,</p>
        <p>The AgroBridge Team</p>
      </div>
    `;

    const rangeSlug = startDate && endDate ? `${startDate}_to_${endDate}` : (range || 'all');
    const filename = `AgroBridge_Report_${rangeSlug}_${new Date().toISOString().slice(0, 10)}.pdf`;

    // Non-blocking email execution. It returns a success status irrespective of absolute delivery status
    try {
      const success = await sendEmail({
        to: req.user.email,
        subject: "Your AgroBridge Report",
        html: htmlContent,
        attachments: [
          {
            filename,
            content: pdfBuffer
          }
        ]
      });
      if (!success) {
        console.log("Email sending attempt completed with false status.");
      }
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    res.status(200).json({
      message: "Report generated. Email sent if possible."
    });

  } catch (error) {
    console.error("Report Controller Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { emailReport, getReportData };

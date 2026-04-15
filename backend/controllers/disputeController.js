const Dispute    = require('../models/Dispute');
const Transaction = require('../models/Transaction');
const SystemSetting = require('../models/SystemSetting');
const Notification = require('../models/Notification');
const sendEmail  = require('../utils/sendEmail');

// ── Email templates ──────────────────────────────────────────────────────────
const emailTemplate = (title, bodyLines) => `
<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0b0f19;color:#e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#0f172a;padding:24px 32px;border-bottom:2px solid #22C55E;">
    <h2 style="margin:0;color:#22C55E;font-size:20px;">🌾 AgroBridge</h2>
  </div>
  <div style="padding:28px 32px;">
    <h3 style="margin:0 0 16px;color:#fff;font-size:18px;">${title}</h3>
    ${bodyLines.map(l => `<p style="margin:6px 0;color:#9ca3af;font-size:14px;line-height:1.6;">${l}</p>`).join('')}
    <div style="margin-top:24px;padding:16px;background:#1e293b;border-radius:8px;border-left:3px solid #22C55E;">
      <p style="margin:0;color:#6b7280;font-size:12px;">Log in to the platform to view full details and respond.</p>
    </div>
  </div>
</div>`;

const DISPUTE_TYPE_LABELS = {
  QUANTITY_MISMATCH: 'Quantity Mismatch',
  PAYMENT_ISSUE:     'Payment Issue',
  QUALITY_ISSUE:     'Quality Issue',
  TRANSPORT_ISSUE:   'Transport Issue',
  OTHER:             'Other',
};

// Helper: send notification email to Users
const notifyUser = async (user, subject, title, lines) => {
  if (!user?.email) return;
  try {
    await sendEmail({ to: user.email, subject, html: emailTemplate(title, lines) });
  } catch (e) {
    console.error('Dispute email error:', e.message);
  }
};

const sendInAppNotification = async (io, userId, title, message, transactionId) => {
  if (!userId) return;
  try {
    await Notification.create({
      user: userId,
      message: `${title} - ${message}`,
      type: 'DISPUTE_UPDATE',
      transactionId: transactionId || null
    });
    if (io) {
      io.to(String(userId)).emit('userNotification', {
        title,
        message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Failed to save notification:', err.message);
  }
};

// ── CREATE DISPUTE ───────────────────────────────────────────────────────────
const createDispute = async (req, res) => {
  try {
    const { description, transactionId, disputeType } = req.body;

    if (!transactionId) return res.status(400).json({ message: 'You must select a transaction.' });
    if (!description?.trim()) return res.status(400).json({ message: 'Description is required.' });

    // Verify transaction and party membership
    const txn = await Transaction.findById(transactionId)
      .populate('farmer',    'fullName email')
      .populate('millOwner', 'fullName email')
      .populate('listing',   'paddyType');

    if (!txn) return res.status(404).json({ message: 'Transaction not found.' });

    const userId    = String(req.user._id);
    const isFarmer  = String(txn.farmer?._id)    === userId;
    const isMill    = String(txn.millOwner?._id)  === userId;

    if (!isFarmer && !isMill) {
      return res.status(403).json({ message: 'You are not a party to this transaction.' });
    }

    const againstUser = isFarmer ? txn.millOwner?._id : txn.farmer?._id;
    const typeLabel   = DISPUTE_TYPE_LABELS[disputeType] || 'Other';
    const orderRef    = txn.orderNumber || txn._id.toString().slice(-6).toUpperCase();
    const title       = `${typeLabel} — Order #${orderRef}`;

    const attachments = (req.files || []).map(f => ({
      fileName: f.originalname,
      fileUrl:  `/uploads/${f.filename}`,
    }));

    const dispute = await new Dispute({
      title,
      description: description.trim(),
      disputeType: disputeType || 'OTHER',
      raisedBy:    req.user._id,
      againstUser,
      transaction: transactionId,
      status:      'OPEN',
      attachments,
      auditLog: [{
        action:          'DISPUTE_CREATED',
        performedBy:     req.user._id,
        performedByRole: req.user.role,
        note:            `Dispute raised: ${title}`,
      }],
    }).save();

    // Broadcast to admins
    const io = req.app.get('io');
    if (io) io.emit('disputeUpdated');

    // Email reporter
    await notifyUser(req.user, `[AgroBridge] Dispute Created — ${title}`, 'Dispute Submitted', [
      `Your dispute has been received and is now under our review queue.`,
      `<strong>Case:</strong> ${title}`,
      `<strong>Transaction:</strong> #${orderRef}`,
      `<strong>Amount:</strong> Rs ${txn.totalAmount?.toLocaleString() || '—'}`,
      `Our team will review your case and respond as soon as possible.`,
    ]);

    // Email support
    try {
      const settings = await SystemSetting.findOne();
      if (settings?.supportEmail) {
        await sendEmail({
          to: settings.supportEmail,
          subject: `[AgroBridge] New Dispute: ${title}`,
          html: emailTemplate('New Dispute Filed', [
            `<strong>Reporter:</strong> ${req.user.fullName} (${req.user.email})`,
            `<strong>Type:</strong> ${typeLabel}`,
            `<strong>Transaction:</strong> #${orderRef} · Rs ${txn.totalAmount?.toLocaleString()}`,
            `<strong>Description:</strong> ${description.trim()}`,
          ]),
        });
      }
    } catch {}

    res.status(201).json({ message: 'Dispute submitted.', dispute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET MY DISPUTES ──────────────────────────────────────────────────────────
const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ raisedBy: req.user._id }, { againstUser: req.user._id }],
      autoGenerated: { $ne: true },
    })
      .populate('raisedBy', 'fullName role')
      .populate('againstUser', 'fullName role')
      .populate({
        path:    'transaction',
        select:  'orderNumber totalAmount quantityKg finalPricePerKg status paymentStatus createdAt',
        populate: { path: 'listing', select: 'paddyType' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ disputes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET DISPUTE BY ID (involved only / admins handled globally elsewhere) ────
const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findOne({
      _id: req.params.id,
      $or: [{ raisedBy: req.user._id }, { againstUser: req.user._id }]
    })
      .populate('messages.sender', 'fullName role')
      .populate('raisedBy', 'fullName role email')
      .populate('againstUser', 'fullName role email')
      .populate({
        path:    'transaction',
        populate: [
          { path: 'farmer',    select: 'fullName email' },
          { path: 'millOwner', select: 'fullName email' },
          { path: 'listing',   select: 'paddyType' },
        ],
      });

    if (!dispute) {
      // Could be admin request? Check admin globally
      if (req.user.role !== 'ADMIN') {
        return res.status(404).json({ message: 'Dispute not found or unauthorized.' });
      }
      
      const adminDispute = await Dispute.findById(req.params.id)
        .populate('messages.sender', 'fullName role')
        .populate('raisedBy', 'fullName role email')
        .populate('againstUser', 'fullName role email')
        .populate({
          path:    'transaction',
          populate: [
            { path: 'farmer',    select: 'fullName email' },
            { path: 'millOwner', select: 'fullName email' },
            { path: 'listing',   select: 'paddyType' },
          ],
        });
      if (!adminDispute) return res.status(404).json({ message: 'Dispute not found.' });
      return res.status(200).json(adminDispute);
    }
    
    res.status(200).json(dispute);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SEND MESSAGE ─────────────────────────────────────────────────────────────
// raisedBy, againstUser, AND admin can POST to this endpoint
const sendDisputeMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'email fullName')
      .populate('againstUser', 'email fullName');
      
    if (!dispute) return res.status(404).json({ message: 'Dispute not found.' });
    if (['RESOLVED', 'REJECTED'].includes(dispute.status)) {
      return res.status(400).json({ message: 'This dispute is closed. No further messages can be sent.' });
    }

    // Auth: raisedBy OR againstUser OR admin
    const isAdmin     = req.user.role === 'ADMIN';
    const isRaisedBy  = String(dispute.raisedBy?._id) === String(req.user._id);
    const isAgainst   = String(dispute.againstUser?._id) === String(req.user._id);

    if (!isAdmin && !isRaisedBy && !isAgainst) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const newMsg = {
      sender:     req.user._id,
      senderRole: req.user.role,
      message:    message.trim(),
    };

    dispute.messages.push(newMsg);
    dispute.auditLog.push({
      action:          'MESSAGE_SENT',
      performedBy:     req.user._id,
      performedByRole: req.user.role,
      note:            `Message sent: "${message.trim().slice(0, 60)}${message.length > 60 ? '…' : ''}"`,
    });
    await dispute.save();

    // Populate sender on the saved message before returning
    await dispute.populate('messages.sender', 'fullName role');
    const savedMsg = dispute.messages[dispute.messages.length - 1];

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('disputeMessage', savedMsg);
      io.emit('disputeUpdated');
      
      // Notify the appropriate parties
      const senderIdStr = String(req.user._id);
      
      const recipients = [];
      if (isAdmin) {
        if (dispute.raisedBy) recipients.push(dispute.raisedBy);
        if (dispute.againstUser) recipients.push(dispute.againstUser);
      } else if (isRaisedBy) {
        if (dispute.againstUser) recipients.push(dispute.againstUser);
      } else if (isAgainst) {
        if (dispute.raisedBy) recipients.push(dispute.raisedBy);
      }

      for (const recipient of recipients) {
        // In-app Notification
        await sendInAppNotification(io, recipient._id, `New message in dispute: ${dispute.title}`, `You have a new message: "${message.trim().substring(0, 50)}..."`, dispute.transaction);
        // Email Notification
        notifyUser(recipient, `[AgroBridge] New Message in Dispute — ${dispute.title}`, 'New Message Added', [
          `You have received a new message regarding your dispute: ${dispute.title}.`,
          `<strong>Message:</strong> "${message.trim()}"`,
          `Please log into your dashboard to reply.`
        ]);
      }
    }

    res.status(201).json({ message: 'Message sent.', data: savedMsg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createDispute, getMyDisputes, getDisputeById, sendDisputeMessage };

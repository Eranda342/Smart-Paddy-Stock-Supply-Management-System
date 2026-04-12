const crypto = require("crypto");
const sendEmail = require("./sendEmail");

const generateEmailToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  // Expiry is set to 1 hour exactly
  const expire = Date.now() + 1 * 60 * 60 * 1000;
  return { token, hashedToken, expire };
};

const getVerificationEmailTemplate = (verifyUrl, fullName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Email - AgroBridge</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <!-- MAIN CONTAINER -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
            
            <!-- HEADER (Gradient Green) -->
            <tr>
              <td align="center" style="padding: 35px 40px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">AgroBridge</h1>
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Account Verification</p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">Verify Your Email</h2>
                
                <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi ${fullName || "there"}, 👋
                </p>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                  Welcome to AgroBridge! You've successfully created an account. Please verify your email address to get full access to the platform.
                </p>

                <!-- BUTTON -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="border-radius: 8px; background-color: #22c55e;">
                            <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; background: linear-gradient(to right, #22c55e, #16a34a); outline: none;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- BACKUP LINK -->
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 32px; word-break: break-all;">
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">Button not working? Copy and paste this link:</p>
                  <a href="${verifyUrl}" style="color: #3b82f6; font-size: 13px; text-decoration: underline;">${verifyUrl}</a>
                </div>

                <!-- SECURITY NOTICE -->
                <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px;">
                  <p style="color: #9a3412; font-size: 14px; margin: 0 0 6px 0; font-weight: 600;">Security Notice</p>
                  <ul style="margin: 0; padding-left: 20px; color: #c2410c; font-size: 13px; line-height: 1.5;">
                    <li>For your security, this verification link will expire in exactly <strong>1 hour</strong>.</li>
                    <li>If you didn't create an account, you can safely delete this email.</li>
                  </ul>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td align="center" style="padding: 24px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">AgroBridge Marketplace</p>
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">Connecting Farmers & Mill Owners</p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 16px 0 0 0;">&copy; ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const sendVerificationEmail = async (user, token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email/${token}`;
  
  await sendEmail({
    email: user.email,
    subject: "Action Required: Verify your AgroBridge account",
    message: `Please verify your email: ${verifyUrl}`,
    html: getVerificationEmailTemplate(verifyUrl, user.fullName)
  });
};

const getApprovalEmailTemplate = (loginLink) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved - AgroBridge</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
            <tr>
              <td align="center" style="padding: 35px 40px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">AgroBridge</h1>
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Account Approved</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">You're Approved! 🎉</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                  Congratulations! Your account on AgroBridge has been successfully reviewed and approved by our administration team. You now have full access to our platform.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <a href="${loginLink}" target="_blank" style="display: inline-block; padding: 16px 36px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; background: linear-gradient(to right, #22c55e, #16a34a); outline: none;">
                        Go to Dashboard
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">AgroBridge Marketplace</p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 16px 0 0 0;">&copy; ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const getRejectionEmailTemplate = (reason, resubmitLink) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Action Needed - AgroBridge</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
            <tr>
              <td align="center" style="padding: 35px 40px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">AgroBridge</h1>
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Action Required</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">Application Update</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  We have reviewed your application for AgroBridge. Unfortunately, we cannot approve it at this time due to the following reason:
                </p>
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 32px;">
                  <p style="color: #991b1b; font-size: 15px; margin: 0; font-weight: 500;">
                    ${reason}
                  </p>
                </div>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                  Please click the button below to update your details and resubmit your application.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <a href="${resubmitLink}" target="_blank" style="display: inline-block; padding: 16px 36px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; background: linear-gradient(to right, #ef4444, #dc2626); outline: none;">
                        Fix & Resubmit
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 24px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">AgroBridge Marketplace</p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 16px 0 0 0;">&copy; ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

module.exports = {
  generateEmailToken,
  sendVerificationEmail,
  getApprovalEmailTemplate,
  getRejectionEmailTemplate
};

// ─────────────────────────────────────────────────────────────────────────────
// AgroBridge — SMS Utility (Simulated / Console Mode)
//
// Currently runs in FAKE mode: no external API is called.
// To upgrade to a real SMS provider (e.g. Twilio, Vonage, Dialog Axiata):
//   1. Install the provider SDK
//   2. Replace the console.log block below with the real API call
//   3. Add provider credentials to .env
//   4. All calling code in controllers stays unchanged.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends an SMS message (simulated via console log).
 *
 * @param {string} phone   - Recipient phone number (e.g. "+94771234567")
 * @param {string} message - Plain-text SMS body
 * @returns {Promise<{ success: boolean }>}
 */
const sendSMS = async (phone, message) => {
  // ── FAKE MODE ─────────────────────────────────────────────────────────────
  // Replace this block with a real provider SDK call when ready.
  console.log("\n📩 ===== SMS SENT =====");
  console.log("To     :", phone);
  console.log("Message:\n" + message);
  console.log("======================\n");
  // ── END FAKE MODE ─────────────────────────────────────────────────────────

  return { success: true };
};

module.exports = sendSMS;

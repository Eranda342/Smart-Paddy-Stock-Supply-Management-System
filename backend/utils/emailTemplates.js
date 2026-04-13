const transactionSuccessTemplate = ({ farmerName, millOwnerName, paddyType, quantity, pricePerKg, totalAmount, role }) => {
  const greetingName = role === 'FARMER' ? farmerName : millOwnerName;
  const partnerName = role === 'FARMER' ? millOwnerName : farmerName;
  const partnerRole = role === 'FARMER' ? 'Mill Owner' : 'Farmer';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2e7d32; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">AgroBridge</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">Smart Paddy Stock Supply Management</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2e7d32; font-size: 20px;">Transaction Successful!</h2>
        <p>Hello ${greetingName},</p>
        <p>A transaction has been successfully completed with ${partnerRole} <strong>${partnerName}</strong>. Here are the details of the transaction:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Paddy Type:</strong> ${paddyType}</p>
          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${quantity} Kg</p>
          <p style="margin: 5px 0;"><strong>Price per Kg:</strong> Rs. ${pricePerKg}</p>
          <p style="margin: 5px 0; font-size: 16px; color: #d32f2f;"><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
        </div>

        <p>Thank you for using AgroBridge to empower your agricultural business.</p>
        <p>Best Regards,<br><strong>AgroBridge Team</strong></p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
      </div>
    </div>
  `;
};

const negotiationAcceptedTemplate = ({ farmerName, millOwnerName, paddyType, quantity, pricePerKg, role }) => {
  const greetingName = role === 'FARMER' ? farmerName : millOwnerName;
  const partnerName = role === 'FARMER' ? millOwnerName : farmerName;
  const partnerRole = role === 'FARMER' ? 'Mill Owner' : 'Farmer';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1976d2; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">AgroBridge</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">Smart Paddy Stock Supply Management</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #1976d2; font-size: 20px;">Negotiation Accepted!</h2>
        <p>Hello ${greetingName},</p>
        <p>Great news! Your negotiation with ${partnerRole} <strong>${partnerName}</strong> has been accepted. The formal transaction has been initiated.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Paddy Type:</strong> ${paddyType}</p>
          <p style="margin: 5px 0;"><strong>Agreed Quantity:</strong> ${quantity} Kg</p>
          <p style="margin: 5px 0;"><strong>Agreed Price per Kg:</strong> Rs. ${pricePerKg}</p>
        </div>

        <p>Log in to your AgroBridge dashboard to view the transaction details and proceed with the next steps.</p>
        <p>Best Regards,<br><strong>AgroBridge Team</strong></p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
      </div>
    </div>
  `;
};

const transportAssignedTemplate = ({ farmerName, vehicleNumber, driverName, driverPhone, paddyType, quantity }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f57c00; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">AgroBridge</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">Smart Paddy Stock Supply Management</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f57c00; font-size: 20px;">Transport Assigned 🚛</h2>
        <p>Hello ${farmerName},</p>
        <p>The buyer has assigned transport for your stock. Please prepare the following order for pickup:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">Order Details</p>
          <p style="margin: 5px 0;"><strong>Paddy Type:</strong> ${paddyType}</p>
          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${quantity} Kg</p>
          
          <p style="margin: 15px 0 5px 0; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px;">Transport Details</p>
          <p style="margin: 5px 0;"><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
          <p style="margin: 5px 0;"><strong>Driver Name:</strong> ${driverName}</p>
          <p style="margin: 5px 0;"><strong>Driver Phone:</strong> ${driverPhone}</p>
        </div>

        <p>Please contact the driver if you need to coordinate the pickup schedule.</p>
        <p>Best Regards,<br><strong>AgroBridge Team</strong></p>
      </div>
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">© ${new Date().getFullYear()} AgroBridge. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = {
  transactionSuccessTemplate,
  negotiationAcceptedTemplate,
  transportAssignedTemplate
};

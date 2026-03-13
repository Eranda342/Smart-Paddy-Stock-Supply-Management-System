const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {

  const notifications = await Notification
    .find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json({ notifications });

};

const markAsRead = async (req, res) => {

  const notification = await Notification.findById(req.params.id);

  notification.read = true;

  await notification.save();

  res.json({ success: true });

};

module.exports = {
  getNotifications,
  markAsRead
};
const express = require('express');
const router = express.Router();
const { getMonthlySales } = require('../controllers/analyticsController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/monthly-sales', verifyToken, requireAdmin, getMonthlySales);

module.exports = router;

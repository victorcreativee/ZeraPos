const reportsService = require("./reports.service");

async function getMyDashboardStats(req, res) {
  try {
    const stats = await reportsService.getMyDashboardStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getMyDashboardStats,
};

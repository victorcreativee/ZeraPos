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

async function getMyOrdersHistory(req, res) {
  try {
    const date = req.query.date;

    const history = await reportsService.getMyOrdersHistory(req.user.id, date);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function getManagerDashboardStats(req, res) {
  try {
    const stats = await reportsService.getManagerDashboardStats();

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
async function getManagerRestaurantDashboard(req, res) {
  try {
    const dashboard = await reportsService.getManagerRestaurantDashboard();

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function getCounterDashboardStats(req, res) {
  try {
    const stats = await reportsService.getCounterDashboardStats(req.user.id);

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

async function getCashierShiftSummary(req, res) {
  try {
    const date = req.query.date;

    const summary = await reportsService.getCashierShiftSummary(
      req.user.id,
      date
    );

    res.json({
      success: true,
      data: summary,
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
  getMyOrdersHistory,
  getManagerDashboardStats,
  getManagerRestaurantDashboard,
  getCounterDashboardStats,
  getCashierShiftSummary,
};

const settingsService = require("./settings.service");

async function getSettings(req, res) {
  try {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateSettings(req, res) {
  try {
    const settings = await settingsService.updateSettings(req.body);

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};

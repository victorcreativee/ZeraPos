const backupsService = require("./backups.service");

async function createBackup(req, res) {
  try {
    const backup = await backupsService.createBackup();

    res.json({
      success: true,
      message: "Database backup created successfully",
      data: backup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listBackups(req, res) {
  try {
    const backups = await backupsService.listBackups();

    res.json({
      success: true,
      data: backups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function restoreBackup(req, res) {
  try {
    if (!file_name) {
      return res.status(400).json({
        success: false,
        message: "Backup file name is required",
      });
    }

    if (!file_name.endsWith(".db")) {
      return res.status(400).json({
        success: false,
        message: "Invalid backup file",
      });
    }
    const { file_name } = req.body;

    const result = await backupsService.restoreBackup(file_name);

    res.json({
      success: true,
      message: "Database restored successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
async function openBackupsFolder(req, res) {
  try {
    const result = await backupsService.openBackupsFolder();

    res.json({
      success: true,
      message: "Backup folder opened",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = {
  createBackup,
  listBackups,
  restoreBackup,
  openBackupsFolder,
};

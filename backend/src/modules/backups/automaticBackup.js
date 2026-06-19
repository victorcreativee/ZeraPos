const backupsService = require("./backups.service");

async function runAutomaticBackup() {
  try {
    const result = await backupsService.createAutomaticDailyBackup();

    if (result.skipped) {
      console.log("Auto backup:", result.message);
    } else {
      console.log("Auto backup:", result.file_name);
    }
  } catch (error) {
    console.log("Auto backup failed:", error.message);
  }
}

function startAutomaticBackupScheduler() {
  runAutomaticBackup();

  setInterval(() => {
    runAutomaticBackup();
  }, 60 * 60 * 1000);
}

module.exports = {
  startAutomaticBackupScheduler,
};

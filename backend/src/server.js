const app = require("./app");

const PORT = process.env.PORT || 5005;
const {
  startAutomaticBackupScheduler,
} = require("./modules/backups/automaticBackup");
app.listen(PORT, () => {
  console.log(`zeraPOS server running on port ${PORT}`);
  startAutomaticBackupScheduler();
});

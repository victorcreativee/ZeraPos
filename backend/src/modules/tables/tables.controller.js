const tablesService = require("./tables.service");

async function getTables(req, res) {
  try {
    const tables = await tablesService.getTables();

    res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createTable(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Table name is required",
      });
    }

    const table = await tablesService.createTable(req.body);

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
async function getTableActiveBill(req, res) {
  try {
    const bill = await tablesService.getTableActiveBill(req.params.id);

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = {
  getTables,
  createTable,
  getTableActiveBill,
};

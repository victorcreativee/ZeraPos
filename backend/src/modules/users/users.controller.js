const usersService = require("./users.service");

async function createUser(req, res) {
  try {
    const { name, role, pin } = req.body;

    if (!name || !role || !pin) {
      return res.status(400).json({
        success: false,
        message: "Name, role, and PIN are required",
      });
    }

    const user = await usersService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getUsers(req, res) {
  try {
    const users = await usersService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Name and role are required",
      });
    }

    const user = await usersService.updateUser(id, req.body);

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function changePin(req, res) {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN is required",
      });
    }

    const result = await usersService.changeUserPin(id, pin);

    res.json({
      success: true,
      message: "PIN changed successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createUser,
  getUsers,
  updateUser,
  changePin,
};

const productsService = require("./products.service");

async function getProducts(req, res) {
  try {
    const { category_id, low_stock } = req.query;

    const products = low_stock
      ? await productsService.getLowStockProducts()
      : category_id
      ? await productsService.getProductsByCategory(category_id)
      : await productsService.getProducts();

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const product = await productsService.createProduct({
      ...req.body,
      created_by: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productsService.updateProduct(req.params.id, {
      ...req.body,
      updated_by: req.user?.id,
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function deactivateProduct(req, res) {
  try {
    const product = await productsService.deactivateProduct(req.params.id);

    res.json({
      success: true,
      message: "Product deactivated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
};

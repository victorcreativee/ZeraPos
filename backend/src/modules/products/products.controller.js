const productsService = require("./products.service");

async function getProducts(req, res) {
  try {
    const { category_id } = req.query;

    const products = category_id
      ? await productsService.getProductsByCategory(category_id)
      : await productsService.getProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required",
      });
    }

    const product = await productsService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getProducts,
  createProduct,
};

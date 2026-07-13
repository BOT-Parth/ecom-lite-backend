const ProductService = require('../services/product.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class ProductController {
  create = asyncHandler(async (req, res) => {
    const { name, description, price, imageUrls, categoryId } = req.body;
    const { storeId } = req.params;

    const product = await ProductService.createProduct({
      name,
      description,
      price,
      imageUrls,
      categoryId,
      storeId,
    });

    return sendSuccess(res, 'Product created successfully', { product }, 201);
  });

  list = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const { categoryId } = req.query;

    const products = await ProductService.listProducts(storeId, categoryId);
    return sendSuccess(
      res,
      'Products retrieved successfully',
      { products },
      200
    );
  });

  getById = asyncHandler(async (req, res) => {
    const { id, storeId } = req.params;
    const product = await ProductService.getProductById(id, storeId);
    return sendSuccess(
      res,
      'Product details retrieved successfully',
      { product },
      200
    );
  });

  update = asyncHandler(async (req, res) => {
    const { id, storeId } = req.params;
    const product = await ProductService.updateProduct(id, storeId, req.body);
    return sendSuccess(res, 'Product updated successfully', { product }, 200);
  });

  delete = asyncHandler(async (req, res) => {
    const { id, storeId } = req.params;
    await ProductService.deleteProduct(id, storeId);
    return sendSuccess(res, 'Product deleted successfully', null, 200);
  });
}

module.exports = new ProductController();

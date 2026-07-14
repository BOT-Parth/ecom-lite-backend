/**
 * Layer:      Controllers
 *
 * Purpose:
 * Receives HTTP requests for category endpoints (create, list, update, delete),
 * delegates to CategoryService, and returns formatted responses.
 *
 * Called By:
 * src/routes/category.routes.js
 *
 * Calls:
 * src/services/category.service.js
 * src/utils/response.js  (sendSuccess)
 * src/utils/async.js     (asyncHandler)
 *
 * Request Flow:
 * category.routes.js
 *   → category.controller.js
 *   → category.service.js
 *   → category.repository.js
 *   → Prisma → PostgreSQL
 */

const CategoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class CategoryController {
  create = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
    const { storeId } = req.params;

    const category = await CategoryService.createCategory({
      name,
      slug,
      storeId,
    });

    return sendSuccess(
      res,
      'Category created successfully',
      { category },
      201
    );
  });

  list = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const categories = await CategoryService.listCategories(storeId);
    return sendSuccess(
      res,
      'Categories retrieved successfully',
      { categories },
      200
    );
  });

  update = asyncHandler(async (req, res) => {
    const { id, storeId } = req.params;
    const category = await CategoryService.updateCategory(
      id,
      storeId,
      req.body
    );
    return sendSuccess(
      res,
      'Category updated successfully',
      { category },
      200
    );
  });

  delete = asyncHandler(async (req, res) => {
    const { id, storeId } = req.params;
    await CategoryService.deleteCategory(id, storeId);
    return sendSuccess(res, 'Category deleted successfully', null, 200);
  });
}

module.exports = new CategoryController();

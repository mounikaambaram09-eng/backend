const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/create', categoryController.createCategory);
router.get('/list', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.get('/:id/products', categoryController.getProductsByCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/add', cartController.addToCart);
router.get('/:userId', cartController.getUserCart);
router.put('/:id', cartController.updateCartQuantity);
router.delete('/:id', cartController.removeCartItem);
router.delete('/user/:userId', cartController.clearCart);

module.exports = router;
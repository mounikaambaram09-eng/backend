const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

   
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ status: false, message: "userId, productId, and quantity are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ status: false, message: "Quantity must be greater than 0" });
    }

   
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

   
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    if (product.status !== "active") {
      return res.status(400).json({ status: false, message: "Product is inactive and cannot be added to cart" });
    }


    const existingCartItem = await Cart.findOne({ userId, productId });
    const currentCartQty = existingCartItem ? existingCartItem.quantity : 0;
    const newTotalQty = currentCartQty + Number(quantity);

    if (newTotalQty > product.stock) {
      return res.status(400).json({ 
        status: false, 
        message: `Insufficient stock! Only ${product.stock} items available.` 
      });
    }

    if (existingCartItem) {
      existingCartItem.quantity = newTotalQty;
      existingCartItem.price = product.price; 
      await existingCartItem.save();

      return res.status(200).json({
        status: true,
        message: "Cart updated successfully (Quantity increased)",
        data: existingCartItem
      });
    } else {
      const cartItem = new Cart({
        userId,
        productId,
        quantity,
        price: product.price
      });
      await cartItem.save();

      return res.status(201).json({
        status: true,
        message: "Product added to cart successfully",
        data: cartItem
      });
    }

  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.find({ userId }).populate('productId', 'name price image description');

    let grandTotal = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.quantity * item.price;
      grandTotal += itemTotal;

      return {
        _id: item._id,
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        itemTotal
      };
    });

    res.status(200).json({
      status: true,
      grandTotal,
      items
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ status: false, message: "Quantity must be greater than 0" });
    }

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({ status: false, message: "Cart item not found" });
    }

    
    const product = await Product.findById(cartItem.productId);
    if (quantity > product.stock) {
      return res.status(400).json({ 
        status: false, 
        message: `Insufficient stock! Only ${product.stock} items available.` 
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      status: true,
      message: "Cart quantity updated successfully",
      data: cartItem
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByIdAndDelete(id);

    if (!cartItem) {
      return res.status(404).json({ status: false, message: "Cart item not found" });
    }

    res.status(200).json({
      status: true,
      message: "Item removed from cart successfully"
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.deleteMany({ userId });

    res.status(200).json({
      status: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
const Order = require("../models/order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");


/* =========================================================
   CREATE ORDER
========================================================= */

exports.createOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    if (!userId || !shippingAddress) {
      return res.status(400).json({
        status: false,
        message: "userId and shippingAddress are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        status: false,
        message: "Admin users cannot place orders",
      });
    }

    const cartItems = await Cart.find({ userId })
      .populate("productId");

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Cart is empty",
      });
    }

    let orderItems = [];
    let totalAmount = 0;

    for (let item of cartItems) {
      const product = item.productId;

      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product no longer exists",
        });
      }

      if (product.status !== "active") {
        return res.status(400).json({
          status: false,
          message: `Product ${product.name} is inactive`,
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          status: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemTotal =
        item.quantity * item.price;

      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,

        name: product.name,

        /* Save product image */
        image: product.image,

        quantity: item.quantity,

        price: item.price,

        total: itemTotal,
      });
    }

    const order = new Order({
      userId,

      items: orderItems,

      totalAmount,

      shippingAddress,

      /* Every newly placed order starts as pending */
      status: "pending",
    });

    await order.save();


    /* Reduce stock */

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }


    /* Clear cart */

    await Cart.deleteMany({ userId });


    res.status(201).json({
      status: true,

      message: "Order placed successfully",

      data: order,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET USER ORDERS
========================================================= */

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();


    /*
      Add current product image as fallback.

      This is useful for older orders where
      image may not have been saved inside order.items.
    */

    for (let order of orders) {

      if (!Array.isArray(order.items)) {
        continue;
      }

      for (let item of order.items) {

        if (!item.productId) {
          continue;
        }

        const product = await Product.findById(
          item.productId
        ).select("image");

        /*
          If order already has image,
          keep that image.

          If old order doesn't have image,
          use current product image.
        */

        if (
          (!item.image ||
            item.image === "") &&
          product
        ) {
          item.image = product.image;
        }
      }
    }


    res.status(200).json({
      status: true,

      count: orders.length,

      data: orders,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET ALL ORDERS
========================================================= */

exports.getAllOrders = async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();


    /*
      Add product images for admin orders page also.
    */

    for (let order of orders) {

      if (!Array.isArray(order.items)) {
        continue;
      }

      for (let item of order.items) {

        if (!item.productId) {
          continue;
        }

        const product = await Product.findById(
          item.productId
        ).select("image");

        if (
          (!item.image ||
            item.image === "") &&
          product
        ) {
          item.image = product.image;
        }
      }
    }


    res.status(200).json({
      status: true,

      count: orders.length,

      data: orders,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* =========================================================
   GET ORDER BY ID
========================================================= */

exports.getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(
      req.params.id
    ).lean();


    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }


    /*
      Add product image fallback for
      old orders.
    */

    if (Array.isArray(order.items)) {

      for (let item of order.items) {

        if (
          item.productId &&
          (!item.image || item.image === "")
        ) {

          const product =
            await Product.findById(
              item.productId
            ).select("image");

          if (product) {
            item.image = product.image;
          }
        }
      }
    }


    res.status(200).json({
      status: true,

      data: order,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

exports.updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];


    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid order status",
      });
    }


    const order = await Order.findById(
      req.params.id
    );


    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }


    order.status = status;

    await order.save();


    res.status(200).json({
      status: true,

      message: "Order status updated",

      data: order,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* =========================================================
   CANCEL ORDER
========================================================= */

exports.cancelOrder = async (req, res) => {
  try {

    const order = await Order.findById(
      req.params.id
    );


    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }


    if (
      !["pending", "confirmed"].includes(
        order.status
      )
    ) {
      return res.status(400).json({
        status: false,

        message:
          `Cannot cancel order with status '${order.status}'`,
      });
    }


    order.status = "cancelled";

    await order.save();


    /*
      Restore product stock
    */

    for (let item of order.items) {

      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }


    res.status(200).json({
      status: true,

      message:
        "Order cancelled and stock restored successfully",

      data: order,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};


/* =========================================================
   DELETE ORDER
========================================================= */

exports.deleteOrder = async (req, res) => {
  try {

    const order =
      await Order.findByIdAndDelete(
        req.params.id
      );


    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }


    res.status(200).json({
      status: true,

      message: "Order record deleted",
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
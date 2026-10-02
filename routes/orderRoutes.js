const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);

router.get("/user/:userId", orderController.getUserOrders);


router.get("/:id", orderController.getOrderById);


router.put("/:id/status", orderController.updateOrderStatus);


router.put("/:id/cancel", orderController.cancelOrder);


router.delete("/:id", orderController.deleteOrder);

module.exports = router;
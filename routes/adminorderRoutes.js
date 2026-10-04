const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");


const {
  authenticate,
  isAdmin,
} = require("../middleware/authmiddleware");

router.get(
  "/orders",
  authenticate,
  isAdmin,
  orderController.getAllOrders
);

module.exports = router;
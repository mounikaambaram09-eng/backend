const express = require("express");
const cors = require("cors");
const path = require("path"); 
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userroute");
const productRoutes = require("./routes/productRoutes"); 
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes"); 
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminorderRoutes");
const mutualFundRoutes = require("./routes/mutualFundRoutes");

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.use("/user", userRoutes);
app.use("/product", productRoutes); 
app.use("/category", categoryRoutes);
app.use("/cart", cartRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/admin",  adminOrderRoutes);
app.use("/api/mutual-funds", mutualFundRoutes);

console.log("Cart Routes Loaded Successfully!");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
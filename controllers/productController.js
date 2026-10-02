const Product = require("../models/Product");
const Category = require("../models/Category");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, status, categoryId, image } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ status: false, message: "Name, price and stock are mandatory" });
    }

    if (price <= 0) {
      return res.status(400).json({ status: false, message: "Price must be greater than 0" });
    }

    if (stock < 0) {
      return res.status(400).json({ status: false, message: "Stock cannot be negative" });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({ status: false, message: "Status should be active or inactive" });
    }

    if (!categoryId) {
      return res.status(400).json({ status: false, message: "categoryId is mandatory" });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ status: false, message: "Category does not exist" });
    }

    if (categoryExists.status === "inactive") {
      return res.status(400).json({ status: false, message: "Cannot assign product to an inactive category" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      status: status || "active",
      categoryId,
      image 
    });

    return res.status(201).json({
      status: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId");
    return res.status(200).json({
      status: true,
      data: products
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categoryId");
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    return res.status(200).json({
      status: true,
      data: product
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: "Invalid ID or Product not found" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
  
    const { name, description, price, stock, status, categoryId, image } = req.body;

    if (price !== undefined && price <= 0) {
      return res.status(400).json({ status: false, message: "Price must be greater than 0" });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ status: false, message: "Stock cannot be negative" });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({ status: false, message: "Status should be active or inactive" });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ status: false, message: "Category does not exist" });
      }
      if (categoryExists.status === "inactive") {
        return res.status(400).json({ status: false, message: "Cannot assign product to an inactive category" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock, status, categoryId, image }, // ఇక్కడ కూడా image పాస్ చేశాము
      { new: true, runValidators: true }
    ).populate("categoryId");

    if (!updatedProduct) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: "Invalid ID or Product not found" });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: "Invalid ID or Product not found" });
  }
};
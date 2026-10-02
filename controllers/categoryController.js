const Category = require('../models/Category');
const Product = require('../models/Product');


exports.createCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name) return res.status(400).json({ message: "Name is mandatory" });

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return res.status(400).json({ message: "Category name already exists" });

        const category = await Category.create({ name, description, status });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getCategories = async (req, res) => {
    try {
        const filter = req.query.status ? { status: req.query.status } : {};
        const categories = await Category.find(filter);
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.id });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
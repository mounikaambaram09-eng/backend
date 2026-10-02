const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is mandatory'] 
    },
    description: { 
        type: String, 
        required: [true, 'Description is mandatory'] 
    },
    price: { 
        type: Number, 
        required: [true, 'Price is mandatory'], 
        min: [0, 'Price must be greater than 0'] 
    },
    stock: { 
        type: Number, 
        required: [true, 'Stock is mandatory'], 
        min: [0, 'Stock cannot be negative'] 
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'],
        default: 'active' 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category'
    },
    image: { 
        type: String,
        require:true,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
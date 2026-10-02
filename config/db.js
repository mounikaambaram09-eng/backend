const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            family: 4
        });

        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
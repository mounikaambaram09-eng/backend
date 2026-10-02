const mongoose = require("mongoose");

const mutualFundSchema = new mongoose.Schema(
  {
    schemeCode: { type: String, required: true, unique: true },
    schemeName: { type: String, required: true },
    fundHouse: { type: String },
    schemeType: { type: String },
    schemeCategory: { type: String },
    isinGrowth: { type: String },
    isinDivReinvestment: { type: String },
    latestNav: { type: Number },
    latestNavDate: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MutualFund", mutualFundSchema);
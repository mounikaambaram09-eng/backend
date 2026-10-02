const axios = require("axios");
const MutualFund = require("../models/MutualFund");

const MFAPI_BASE_URL = "https://api.mfapi.in";


exports.searchMutualFunds = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ status: false, message: "Search query parameter 'q' is required" });
    }

    const response = await axios.get(`${MFAPI_BASE_URL}/mf/search?q=${q}`);
    res.status(200).json({ status: true, data: response.data });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching data from MFAPI", error: error.message });
  }
};


exports.getSchemeAndSave = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    const response = await axios.get(`${MFAPI_BASE_URL}/mf/${schemeCode}`);
    const data = response.data;

    if (!data || !data.meta) {
      return res.status(404).json({ status: false, message: "Scheme not found on MFAPI" });
    }

    const meta = data.meta;

    
    const updatedFund = await MutualFund.findOneAndUpdate(
      { schemeCode: meta.scheme_code },
      {
        schemeCode: meta.scheme_code,
        schemeName: meta.scheme_name,
        fundHouse: meta.fund_house,
        schemeType: meta.scheme_type,
        schemeCategory: meta.scheme_category,
        isinGrowth: meta.isin_growth,
        isinDivReinvestment: meta.isin_div_reinvestment,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: true,
      message: "Mutual fund details saved/updated successfully",
      data: updatedFund,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error processing scheme details", error: error.message });
  }
};

exports.getLatestNavAndSave = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    const response = await axios.get(`${MFAPI_BASE_URL}/mf/${schemeCode}/latest`);
    const data = response.data;

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ status: false, message: "Latest NAV not found" });
    }

    const latestNavData = data.data[0];

    
    const updatedFund = await MutualFund.findOneAndUpdate(
      { schemeCode: schemeCode },
      {
        latestNav: parseFloat(latestNavData.nav),
        latestNavDate: latestNavData.date,
      },
      { new: true }
    );

    if (!updatedFund) {
      return res.status(404).json({
        status: false,
        message: "Scheme record not found in MongoDB. Please call Get Scheme API first to create record.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Latest NAV updated successfully",
      data: updatedFund,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching latest NAV", error: error.message });
  }
};

exports.getNavHistory = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const response = await axios.get(`${MFAPI_BASE_URL}/mf/${schemeCode}`);

    res.status(200).json({
      status: true,
      schemeName: response.data.meta.scheme_name,
      navHistory: response.data.data,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching NAV history", error: error.message });
  }
};

exports.getStoredMutualFunds = async (req, res) => {
  try {
    const funds = await MutualFund.find();
    res.status(200).json({
      status: true,
      count: funds.length,
      data: funds,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
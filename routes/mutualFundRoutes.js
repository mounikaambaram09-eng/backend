const express = require("express");
const router = express.Router();
const mutualFundController = require("../controllers/mutualFundController");

router.get("/search", mutualFundController.searchMutualFunds);
router.get("/", mutualFundController.getStoredMutualFunds);

router.get("/:schemeCode/latest", mutualFundController.getLatestNavAndSave);
router.get("/:schemeCode/nav-history", mutualFundController.getNavHistory);


router.get("/:schemeCode", mutualFundController.getSchemeAndSave);

module.exports = router;
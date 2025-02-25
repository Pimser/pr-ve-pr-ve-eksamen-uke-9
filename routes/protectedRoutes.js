const express = require("express");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

//beskyttet rute
router.get("/reinsdyrLog", authMiddleware, (req, res) => {
    res.render("dashboard", { user: req.user }); //bruker brukeresn id i request objektet
});

module.exports = router;
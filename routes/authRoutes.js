
const express = require("express");
const authController = require("../controller/authController");
const router = express.Router();


//Get forespørsler:
router.get("/signup", authController.signup_get);
router.get("/login", authController.login_get);
router.get("/reinsdyrLog", authController.reinsdyrLog_get);
router.get("/logout", authController.logout_get);
router.get("/prosjektSetup", authController.prosjektSetup_get);

//post forespørsler
router.post("/signup", authController.signup_post);
router.post("/login", authController.login_post);


module.exports = router;
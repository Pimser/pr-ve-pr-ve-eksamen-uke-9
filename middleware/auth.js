const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.id);
        req.user = user;  // Setter brukeren i req.user
        res.locals.user = user;  // Gjør brukeren tilgjengelig i views
    } catch (err) {
        console.log(err);
        req.user = null;
    }

    next();
};

module.exports = authMiddleware;

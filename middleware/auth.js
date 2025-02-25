const jwt = require("jsonwebtoken");

const authMiddleware = (rew, res, next) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Ingen token funnet!"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  //legger til brukerens id i request objektet
        next(); //fortsetter til neste rute

    } catch (err) {
        res.status(401).json({ error: "Ugyldig token!" });
    }
    
};

module.exports = authMiddleware;
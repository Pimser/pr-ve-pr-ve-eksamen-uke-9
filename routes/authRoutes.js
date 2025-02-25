const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

//signup post route
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    //valideringer
    const errors = {};
    if (!email) errors.email = "Epost må fylles ut!";
    if (!password) errors.password = "Passord my fylles ut!";

    if (Object.keys(errors).length > 0) {
        return res.json({ errors });
    }

    try {
        //sjekker om eposten allerede eksisterer i databasen:
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            errors.email = "Epost er allerede i bruk!"
            return res.json({ errors });
        }

        //kryptering av passord:
        const hashedPassword = await bcrypt.hash(password, 10);

        //dette er for å lagre brukeren i databasen:
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        //genererer JWT-token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h" //tokenen vil være gyldig i 1 time
        });


        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Noe gikk galt på authRoutes."})
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const errors = {};

    if (!email) errors.email = "Epost må fylles ut!"
    if (!password) errors.password = "Passord må fylles ut!"

    if (Object.keys(errors).length > 0) {
        return res.json({ errors });
    }

    try {
        //sjekker om brukeren finnes i databasen
        const user = await User.findOne({ email });
        if (!user) {
            errors.email = "Brukeren finner ikke!"
            return res.json({ errors });
        }

        //sjekk om passord stemmer
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            errors.password = "Feil passord!"
            return res.json({ errors });
        }

        //genererer JWT token
        const token = jwt.sign({ userId: user-_id }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.json({ token }); //sender token til frontend som response
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "noe gikk galt.."});
    }
    
});

module.exports = router;
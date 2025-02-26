const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");


const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", password: ""};

    //sjekker om emailen er feil
    if (err.message === "incorrect email") {
        errors.email = "email ikke registrert"
    }
    if (err.message === "incorrect password") {
        errors.password = "feil passord";
    }

    //email finnes fra før
    if (err.code == 11000) {
        errors.email = "Email er allerede registrert"
        return errors;
    }

    //validering errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60  //3 dager levetid for token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {  //henter secret fra .env filen
        expiresIn: maxAge
    });
}

//Get Requests
module.exports.signup_get = (req, res) => {
    res.render("signup", { user: req.user || null });
}

module.exports.login_get = (req, res) => {
    res.render("login", { user: req.user || null });
}

module.exports.reinsdyrLog_get = (req, res) => {
    res.render("reinsdyrLog", { user: req.user || null });
}

module.exports.logout_get = (req, res) => {
    res.clearCookie("jwt"); // Fjern JWT-cookie
    res.redirect("/"); // Omdiriger til forsiden
};





//Post requests:

module.exports.signup_post = async (req, res) => {
    console.log("signup request received");
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
        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     errors.email = "Epost er allerede i bruk!"
        //     return res.json({ errors });
        // }

        //kryptering av passord:
        const hashedPassword = await bcrypt.hash(password, 10);

        //dette er for å lagre brukeren i databasen:
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();

        //genererer JWT-token
        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        //     expiresIn: "1h" //tokenen vil være gyldig i 1 time
        // });

        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({ user: user._id, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Noe gikk galt på authRoutes."})
    }
};

module.exports.login_post = async (req, res) => {
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

        // Generer JWT-token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

        // Sett token i en httpOnly-cookie (for sikkerhet)
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });

        // Send suksessmelding tilbake
        res.status(200).json({ user: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "noe gikk galt.."});
    }
}
require("dotenv").config(); // Henter miljøvariabler fra .env
const { error } = require("console");
const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const protectedRoutes = require("./routes/protectedRoutes");

const app = express();

app.use(cookieParser()); //dette er for å lese cookies
app.use(express.static("public"))
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Viktig for å håndtere form-data

app.use(authMiddleware); //dette gjør slik at brukerdata blir tiljengelig i alle views.

//middleware for å gjøre bruker tiljengelig i views.
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

//view engine
app.set("view engine", "ejs");

const PORT = process.env.PORT || 5000;
const dbURI = process.env.MONGO_URI;

//database tilkobling
mongoose.connect(dbURI)
.then(() => console.log("Tilkoblet til MongoDB databasen"))
.catch(err => console.error("en feil oppsto under database tilkobling", err));

//autentisering med authRoutes for (signup & login)


app.use("/protected", authMiddleware, protectedRoutes); //authmiddleware sjekker om brukeren er autentisert

//routes
app.get("/", (req, res) => {
    res.render("home"); 
});



app.use(authRoutes);

app.listen(PORT, () =>{
    console.log("server is running on http://localhost:5000");
});
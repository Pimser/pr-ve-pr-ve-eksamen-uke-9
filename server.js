require("dotenv").config(); // Henter miljøvariabler fra .env
const { error } = require("console");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/auth");
const protectedRoutes = require("./routes/protectedRoutes");

const app = express();

//middleware
app.use(express.static("public"))
app.use(express.json());

//view engine
app.set("view engine", "ejs");

const PORT = process.env.PORT || 5000;
const dbURI = process.env.MONGO_URI;

//database tilkobling
mongoose.connect(dbURI)
.then(() => console.log("Tilkoblet til MongoDB databasen"))
.catch(err => console.error("en feil oppsto under database tilkobling", err));

//autentisering med authRoutes for (signup & login)
app.use("/auth", authRoutes);

app.use("/protected", authMiddleware, protectedRoutes); //authmiddleware sjekker om brukeren er autentisert

//routes
app.get("/", (req, res) => {
    res.render("home", { user: req.user || null }); // sender 'user' til home.ejs, fallback til null om ikke tilgjengelig
});


app.get("/login", (req,res) => res.render("login", { user: req.user}));
app.get("/signup", (req,res) => res.render("signup", { user: req.user}));
app.get("/reinsdyrLog", (req,res) => {
    res.render("reinsdyrLog", { user: req.user });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token"); // 
    res.redirect("/"); // Omdiriger til hjem-siden etter logout
});


app.listen(PORT, () =>{
    console.log("server is running on http://localhost:5000");
});
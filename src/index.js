const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine','ejs');
app.use(express.static("public"));
app.get("/",(req,res) =>{
    res.render("login");
});
app.get("/signup",(req,res) =>{
    res.render("signup");
});
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };
    try {
        const existingUser = await collection.findOne({ name: data.name });
        if (existingUser) {
            console.log("User already exists");
            res.send("User already exists. Please choose a different username.");
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
            await collection.insertMany([data]);
            console.log("Registration successful");
            res.redirect("/");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred during signup.");
    }
});


app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.send("Username not found");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            return res.render("home");
        } else {
            return res.send("Wrong password");
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).send("An error occurred during login.");
    }
});

const port = 5000;
app.listen(port,() =>{
    console.log(`Server running on port: ${port}`);
});

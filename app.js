const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const { Schema } = mongoose;

const userSchema = new Schema({
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.get("/", function (req, res) {
    res.render("login_register_page.ejs");
});
app.get("/register", function (req, res) {
    res.render("registerPage.ejs");
});
app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save();
    res.render("home");
})

app.get("/login", function (req, res) {
    res.render("loginPage.ejs");
});
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    async function fun() {
        const foundUsername = await User.findOne({ email: username });
        if (foundUsername) {
            if (foundUsername.password === password) {
                res.render("home");
            }
            else {
                res.render("loginPage");
            }
        }
        else {
            res.render("loginPage")
        }
    }
    fun();
})

app.get("/post", function (req, res) {
    res.render("post.ejs");
})
app.get("/detail", function (req, res) {
    res.render("detail.ejs");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
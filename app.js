const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

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

const postSchema = new Schema({
    title: String,
    ingredients: String,
    cookingSteps: String,
    chief: String,
    imageName: String
});

const Detail = mongoose.model('Detail', postSchema);

app.get("/", function (req, res) {
    res.render("login_register_page.ejs");
});

app.get("/home", function (req, res) {
    async function fun() {
        let posts = await Detail.find({});
        res.render("home.ejs", {
            posts: posts
        });
    }
    fun();
})

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
app.post('/post', upload.single('file'), function (req, res) {
    let title = _.upperCase(req.body.recipeName);
    const post = new Detail({
        title: title,
        ingredients: req.body.ingredients,
        cookingSteps: req.body.cookingSteps,
        chief: req.body.chiefName,
        imageName: req.file.originalname
    });
    post.save();

    res.redirect("/home");

});

app.get('/posts/:topic', (req, res) => {
    let requestedTitle = _.upperCase(req.params.topic);

    async function fun() {
        let posts = await Detail.findOne({ title: requestedTitle });

        if (posts) {
            res.render("detail", {
                post: posts
            });
        }
    }
    fun();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
require("dotenv").config();
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


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

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const { Schema } = mongoose;

const userSchema = new Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = new Schema({
    title: String,
    ingredients: String,
    cookingSteps: String,
    chief: String,
    imageName: String
});

const Detail = mongoose.model('Detail', postSchema);

const aboutContent = "Our food blogging platform is a hub for food enthusiasts to discover and share recipes. Explore a wide range of dishes, from traditional to innovative, complete with instructions and visuals. Join our community to share your own recipes and culinary experiences. It's the ultimate destination for food lovers and home chefs!";
const contactContent = "You can reach out to me via mail abcdef@gmail.com";

app.get("/", function (req, res) {
    res.render("login_register_page.ejs");
});

app.get("/login", function (req, res) {
    res.render("loginPage.ejs");
});

app.get("/post", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("post");
    } else {
        res.redirect("login");
    }
})

app.get("/home", function (req, res) {
    if (req.isAuthenticated()) {
        async function fun() {
            let posts = await Detail.find({});
            res.render("home.ejs", {
                posts: posts
            });
        }
        fun();
    } else {
        res.redirect("/login");
    }
});

app.get("/about", function (req, res) {
    res.render("about", { aboutContent: aboutContent });
})
app.get("/contact", function (req, res) {
    res.render("contact", { contactContent: contactContent });
})

app.get("/register", function (req, res) {
    res.render("registerPage.ejs");
});

app.get("/logout", function (req, res) {
    req.logOut(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/login");
        }
    });
})

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    });
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    })
});

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
    if (req.isAuthenticated()) {
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
    } else {
        res.redirect("/login");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
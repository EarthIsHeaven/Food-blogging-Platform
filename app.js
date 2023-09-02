const express = require("express");

const app = express();
const port = 3000;
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("login_register_page.ejs");
});
app.get("/register", function (req, res) {
    res.render("registerPage.ejs");
});
app.get("/login", function (req, res) {
    res.render("loginPage.ejs");
});
app.get("/home", function (req, res) {
    res.render("home.ejs");
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
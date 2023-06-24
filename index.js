// IMPORT REQUIRED MODULES
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser"); 

const fs = require("fs");
const faqDataPath = path.join(__dirname, "data", "faq.json");

let faqList = [];
if (fs.existsSync(faqDataPath)) {
  const faqData = fs.readFileSync(faqDataPath, "utf8");
  faqList = JSON.parse(faqData);
}

const rulesDataPath = path.join(__dirname, "data", "rules.json");

let rulesList = [];
if (fs.existsSync(rulesDataPath)) {
  const rulesData = fs.readFileSync(rulesDataPath, "utf8");
  rulesList = JSON.parse(rulesData);
  rulesList.forEach((rule, index) => {
    if (!rule.id) {
      rule.id = index + 1;
    }
  });
}


// SET UP EXPRESS OBJECT AND PORT
const app = express();
const port = process.env.PORT || "8888";

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false })); 
// CONNECT TO PUG
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");



// PAGE ROUTES
app.get("/", (request, response) => {
  response.render("index", { title: "Home" });
});

app.get("/game", (request, response) => {
  response.render("Game", { title: "Game" });
});

app.get("/rules", (request, response) => {
  response.render("rules", { title: "How to Play", rulesList: rulesList, user: request.cookies.user });
});

app.post("/add-rule", (request, response) => {
  const { number, content } = request.body;
  const ruleItem = {
    number,
    content
  };
  rulesList.push(ruleItem);

  const rulesData = JSON.stringify(rulesList);
  fs.writeFileSync(rulesDataPath, rulesData, "utf8");

  response.redirect("/rules");
});

app.get("/edit-rule/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const ruleItem = rulesList.find(item => item.id === id);
  if (!ruleItem) {
    response.send("Rule not found");
    return;
  }
  response.render("edit-rule", { title: "Edit Rule", ruleItem });
});

app.post("/edit-rule/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const { content } = request.body;
  const ruleItem = rulesList.find(item => item.id === id);
  if (!ruleItem) {
    response.send("Rule not found");
    return;
  }
  ruleItem.content = content;
  response.redirect("/rules");
});

app.post("/delete-rule/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const index = rulesList.findIndex(item => item.id === id);
  if (index === -1) {
    response.send("Rule not found");
    return;
  }
  rulesList.splice(index, 1);
  response.redirect("/rules");
});


app.get("/faq", async (request, response) => {
  response.render("faq", { title: "FAQ", faqList: faqList, user: request.cookies.user });
});

app.post("/add-faq", (request, response) => {
  const { question, answer } = request.body;
  const faqItem = {
    id: faqList.length + 1, 
    question,
    answer,
  };
  faqList.push(faqItem);

  // Save the updated FAQ data to file
  const faqData = JSON.stringify(faqList);
  fs.writeFileSync(faqDataPath, faqData, "utf8");

  response.redirect("/faq");
});


app.get("/edit-faq/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const faqItem = faqList.find(item => item.id === id);
  if (!faqItem) {
    response.send("FAQ item not found");
    return;
  }
  response.render("edit-faq", { title: "Edit FAQ", faqItem });
});

app.post("/edit-faq/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const { question, answer } = request.body;
  const faqItem = faqList.find(item => item.id === id);
  if (!faqItem) {
    response.send("FAQ item not found");
    return;
  }
  faqItem.question = question;
  faqItem.answer = answer;
  response.redirect("/faq");
});

app.post("/delete-faq/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const index = faqList.findIndex(item => item.id === id);
  if (index === -1) {
    response.send("FAQ item not found");
    return;
  }
  faqList.splice(index, 1);
  response.redirect("/faq");
});


app.get("/Player", async (request, response) => {
  let player = await rapidapi.getPlayer();
  response.render("player", { title: "Player", player});
});

app.get("/admin", async (request, response) => {
  response.render("admin", { title: "Admin" });
});

app.get("/admin-panel", (request, response) => {
  const user = request.cookies.user;
  if (user && user.role === "admin") {
    response.render("admin-panel", { title: "Admin Panel" });
  } else {
    response.send("Access denied");
  }
});

app.post("/login", (request, response) => {
  const { username, password } = request.body;

  if (username === "admin" && password === "danyalchatha123") {
    response.cookie("user", { username, role: "admin" });

    response.redirect("/admin-panel");
  } else {
    response.send("Invalid credentials");
  }
});

app.post("/logout", (request, response) => {
  response.clearCookie("user");

  response.redirect("/admin");
});


// CONNECT TO PUBLIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

// SET UP SERVER LISTENING
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
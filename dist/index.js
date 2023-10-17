"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const ejs = require('ejs');
const app = (0, express_1.default)();
const bodyParser = require('body-parser');
let expenses = check((0, fs_1.readFileSync)('expences.json', 'utf8'));
let users = check((0, fs_1.readFileSync)('data.json', 'utf8'));
// readExpensesFromDataJson()
const sessionStorage = require('sessionstorage-for-nodejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/static", express_1.default.static(__dirname + "/public"));
app.set("view engine", "ejs");
function tokenMidlleware(req, res, next) {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
        res.status(400);
        res.redirect('/signin');
        return;
    }
    const myId = req;
    myId["id"] = token;
    next();
}
app.get('/', tokenMidlleware, (req, res) => {
    const myId = req;
    const userId = myId["id"];
    const currentuser = users.find((el) => {
        return el.id == userId;
    });
    const currenexpenses = expenses.filter((el) => {
        return el.userId == userId;
    });
    setTimeout(() => console.log(sessionStorage.getItem('accessToken')), 1000);
    res.status(200);
    res.render('expences', { user: currentuser, expenses: currenexpenses });
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', (req, res) => {
    const body = req.body;
    const currentuser = users.find((el) => {
        return el.email === body.email;
    });
    if (currentuser) {
        console.log('eror on 28', currentuser);
        res.status(400);
        res.send({ message: 'bad requesttt' });
        return;
    }
    const user = Object.assign(Object.assign({}, body), { id: Date.now(), createdAt: '2023/10/13' });
    users.push(user);
    (0, fs_1.writeFileSync)('data.json', JSON.stringify(users));
    sessionStorage.setItem("accessToken", currentuser.id);
    res.status(200);
    res.redirect('/expences');
});
app.get('/signin', (req, res) => {
    res.render('signin');
    console.log(sessionStorage.getItem('accessToken'));
});
app.post('/signin', (req, res) => {
    const body = req.body;
    const currentuser = users.find((el) => {
        return el.email === body.email;
    });
    if (!currentuser) {
        res.status(400);
        res.send({ message: 'bad request no user' });
        return;
    }
    if (currentuser.password !== body.password) {
        res.status(400);
        res.send({ message: 'bad request no pass' });
        return;
    }
    sessionStorage.setItem("accessToken", currentuser.id);
    const currenexpenses = expenses.filter((el) => {
        return el.userId == currentuser.id;
    });
    res.redirect('/');
    res.status(200);
});
app.get('/add-expense', tokenMidlleware, (req, res) => {
    res.status(200);
    res.render('add-expense');
});
app.post('/add-expense', tokenMidlleware, (req, res) => {
    res.status(200);
    const body = req.body;
    const myId = req;
    const userId = myId["id"];
    const currenexpense = Object.assign(Object.assign({}, body), { id: Date.now(), userId: userId });
    expenses.push(currenexpense);
    // writeFileSync('expences.json', JSON.stringify(expenses))
    (0, fs_1.writeFile)('expences.json', JSON.stringify(expenses), (err) => {
        if (err) {
            console.log('writefile error');
            return;
        }
        sessionStorage.setItem("accessToken", userId);
    });
    res.redirect('/');
});
app.listen(3000, () => {
    console.log('server is not running');
});
function check(data) {
    if (data == '') {
        return [];
    }
    return JSON.parse(data);
}

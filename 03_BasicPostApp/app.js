require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const path = require("path")
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./model/user.model.js')
const bcrypt = require('bcrypt');


const saltRounds = 10; // Number of salt rounds

const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
};

const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        return match;
    } catch (err) {
        console.error('Error comparing password:', err);
        throw err;
    }
};

app.use(express.json());
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const posts = [
        { id: 1, image: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', username: 'user1', content: 'How Beautiful !!!!!' },
        { id: 2, image: 'https://images.pexels.com/photos/24300078/pexels-photo-24300078/free-photo-of-blue-suv-with-open-driver-door.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', username: 'user2', content: 'This is the second post' },
    ];
    res.render('index', { title: 'Home Page', posts });
});
app.get('/login', async (req, res) => {
    const { email , password } = req.body ;
    const user = await User.findOne({ email });
    if(!user) res.send('something went wrong!!');
    

    //checking weather password is right or not
    const result = await bcrypt.compare(password,user.password);
    if(!result) res.send("something went wrong!!");

    //if password and mail is correct then redirect to profile page
    const userCookie = jwt.sign({ id: user.id,email: email}, process.env.SECRET_KEY);
    res.cookie('username', userCookie);
    res.redirect('/profile/user.id');
});
app.get('/logout', (req, res) => {
    // res.clearCookie('username');
    res.cookie = "";
    res.send('Cookie has been deleted!');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/register',async (req, res) => {

    const hash = await bcrypt.hash(req.body.password,saltRounds)

    const id = User.create(
        {
            name,
            email,
            age,
            password:hash
        }
    )

    const userCookie = jwt.sign({ id:id,email: email}, process.env.SECRET_KEY);
    res.cookie('username', userCookie);
    res.redirect('/profile/id');
});

app.get('/profile/:id', isLoggedIn(), (req, res) => {
    res.render('profile', { userId : id });
})

// app.post('/profile/:id', isLoggedIn(), (req, res) => {
//     res.render('profile', { userId : id });
// })


function isLoggedIn() {
    if (!req.cookies.username) res.redirect("/login");
}



app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
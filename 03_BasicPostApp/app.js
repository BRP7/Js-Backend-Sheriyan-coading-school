require("dotenv").config();
const express = require("express")
const mongoose = require("./db/index.js")
const app = express()
const path = require("path")
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./model/user.model.js')
const Post = require('./model/post.model.js');
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

// Middleware setup
app.use(express.urlencoded({ extended: true })); // For handling form submissions
app.use(express.json()); // For handling JSON data
app.use(cookieParser()); // For handling cookies


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.dbConnect();

app.get('/', (req, res) => {
    const posts = [
        { id: 1, image: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', username: 'user1', content: 'How Beautiful !!!!!' },
        { id: 2, image: 'https://images.pexels.com/photos/24300078/pexels-photo-24300078/free-photo-of-blue-suv-with-open-driver-door.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', username: 'user2', content: 'This is the second post' },
    ];
    res.render('index', { title: 'Home Page', posts });
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) res.send('something went wrong!!');


    //checking weather password is right or not
    const result = await bcrypt.compare(password, user.password);
    if (!result) res.send("something went wrong!!");

    //if password and mail is correct then redirect to profile page
    const userCookie = jwt.sign({ id: user.id, email: email }, process.env.SECRET_KEY);
    res.cookie('username', userCookie);
    res.redirect(`/profile/${user._id}`);
});
app.get('/logout', (req, res) => {
    // res.clearCookie('username');
    res.cookie = "";
    res.send('Cookie has been deleted!');
});
app.get('/register', (req, res) => {
    res.render('register');
});
// app.post('/register',async (req, res) => {

//     console.log(req.body);
//     // const hash = await bcrypt.hash(req.body.password,saltRounds)

//     // const id = User.create(
//     //     {
//     //         name,
//     //         email,
//     //         age,
//     //         password:hash
//     //     }
//     // )

//     // const userCookie = jwt.sign({ id:id,email: email}, process.env.SECRET_KEY);
//     // res.cookie('username', userCookie);
//     // res.redirect('/profile/id');
// });


app.post('/register', async (req, res) => {
    try {
        const { name, email, age, password } = req.body;
        console.log(req.body); // Check what is logged here

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create and save the user
        const user = new User({ name, email, age, password: hashedPassword });
        await user.save();
        const userCookie = jwt.sign({ id:user._id, email: email }, process.env.SECRET_KEY);
        res.cookie('username', userCookie);
        res.redirect(`/profile/${user._id}`);
        // res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('posts').exec();
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render profile with user data and posts
        res.render('profile', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});




// app.post('/profile/:id', isLoggedIn(), (req, res) => {
//     res.render('profile', { userId : id });
// })


// function isLoggedIn() {
//     if (!req.cookies.username) res.redirect("/login");
// }




//app.post('/like/:postId', async (req, res) => {
//     try {
//         const postId = req.params.postId;
//         const userId = req.cookies.username ? jwt.verify(req.cookies.username, process.env.SECRET_KEY).id : null;

//         if (!userId) {
//             return res.status(401).send('Unauthorized');
//         }

//         const post = await Post.findById(postId);

//         if (post.likes.includes(userId)) {
//             // User has already liked this post, so we remove the like
//             post.likes.pull(userId);
//         } else {
//             // Add user ID to the likes array
//             post.likes.push(userId);
//         }

//         await post.save();
//         res.redirect(`/profile/${userId}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });


// app.post('/edit-post/:postId', async (req, res) => {
//     try {
//         const postId = req.params.postId;
//         const { image, content } = req.body;

//         const post = await Post.findById(postId);

//         if (!post) {
//             return res.status(404).send('Post not found');
//         }

//         // Update post details
//         post.image = image;
//         post.content = content;
//         await post.save();

//         const userId = req.cookies.username ? jwt.verify(req.cookies.username, process.env.SECRET_KEY).id : null;
//         res.redirect(`/profile/${userId}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });



app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
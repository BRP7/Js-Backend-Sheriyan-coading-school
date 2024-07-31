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


const saltRounds = 10; 


// Middleware setup
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(cookieParser()); 


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.dbConnect();


app.get('/', async (req, res) => {
    try {
        const posts = [
            { id: 1, image: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', username: 'user1', content: 'How Beautiful !!!!!' },
            { id: 2, image: 'https://images.pexels.com/photos/24300078/pexels-photo-24300078/free-photo-of-blue-suv-with-open-driver-door.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', username: 'user2', content: 'This is the second post' },
        ];

        // Fetch user data if logged in (assuming user ID is stored in the cookie)
        let user = null;
        const token = req.cookies.username;
        if (token) {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            user = await User.findById(decoded.id);
        }

        res.render('index', { title: 'Home Page', user, posts }); // Pass user data to the template
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found'); // Handle user not found
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials'); // Handle invalid credentials
        }

        // Generate JWT token and set it as a cookie
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY);
        res.cookie('username', token); // Set cookie with token

        // Redirect to profile page with user ID
        return res.redirect(`/profile`);
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).send('Server error'); // Handle server errors
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, age, password } = req.body;
        console.log(req.body); // Check what is logged here

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create and save the user
        const user = new User({ name, email, age, password: hashedPassword });
        await user.save();
        const userCookie = jwt.sign({ id: user._id, email: email }, process.env.SECRET_KEY);
        res.cookie('username', userCookie);
        res.redirect(`/profile`);
        // res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/profile', isLoggedIn, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('post').exec();

        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        res.render('profile', { user });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Server error');
    }
});

app.get('/create-post', (req, res) => {
    res.render('createPost');
});

app.post('/create-post', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user.id;
    
        // console.log(userId);
        const { content } = req.body;

        // console.log(`Creating post for user ID: ${userId}`);

        const newPost = new Post({ user: userId, content: content });
        await newPost.save();
        const user = await User.findById(userId);
        user.post = newPost._id;
        user.save();

        // console.log('Post created successfully:', newPost);

        res.redirect('/profile'); // Redirect to profile page after creating post
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).send('Server error');
    }
});

app.post('/edit/:postid', isLoggedIn, async (req, res) => {
    const postId = req.params.postid;
    const content = req.body.content;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        // Update post content
        post.content = content;
        await post.save();
        
        // Redirect to profile page with updated user data
        const userId = req.user.id;
        const user = await User.findById(userId).populate('post').exec();
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        res.redirect('/profile'); // Render profile with updated user data
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).send('Server error');
    }
});

app.get('/edit/:postid', isLoggedIn, async (req, res) => {
    const postId = req.params.postid 
    try {
        const post = await Post.findById(postId).populate('user').exec();
        if (!post) {
            return res.status(404).send('User not found');
        }
        
        // Render profile with user data and posts
        res.render('edit', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/like/:postid', isLoggedIn, async (req, res) => {
    const postId = req.params.postid;
    const userId = req.user.id; 

    try {
        const post = await Post.findById(postId);
        if (!post) {
            console.log('Post not found');
            return res.status(404).send('Post not found');
        }

        const likeArray = post.likes;

        if (!likeArray.includes(userId)) {
            likeArray.push(userId);
        } else {
            const index = likeArray.indexOf(userId);
            if (index !== -1) {
                likeArray.splice(index, 1);
            }
        }

        await post.save();

        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).send('Server error');
    }
});


//without exlicit save of user it need to be reflected in db
// app.get('/edit/:postid', isLoggedIn, async (req, res) => {
//     const postId = req.params.postid 
//     try {
//         const post = await Post.findById(postId).populate('user').exec();
//         if (!post) {
//             return res.status(404).send('User not found');
//         }
        
//         // Render profile with user data and posts
//         res.render('edit', { post });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });


// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
    const token = req.cookies.username;

    if (!token) {
        return res.redirect('/login'); 
    }
    
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.redirect('/login'); 
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                console.error('User not found for ID:', decoded.id);
                return res.redirect('/login');
            }
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Server error');
        }
    });
}


app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
// // Route to render profile page

// app.get('/profile', isLoggedIn, async (req, res) => {
    //     try {
        //         const userId = req.user.id;
        //         const user = await User.findById(userId).populate('posts').exec();
        //         if (!user) {
            //             console.error('User not found for ID:', userId);
            //             return res.status(404).send('User not found');
            //         }
            
            //         res.render('profile', { user });
            //     } catch (err) {
                //         console.error('Error fetching profile:', err);
                //         res.status(500).send('Server error');
                //     }
                // });
                
                // app.post('/edit/:postid', isLoggedIn, async (req, res) => {
                //     const postId = req.params.postid 
                //     const content = req.body.content 
                //     try {
                //         const post = await Post.findById(postId);
                //         post.content = content;
                //         post.save();
                //         // res.send("done");
                //         // req.cookies.username.userId
                //         // Render profile with user data and posts
                //         res.render('profile');
                //     } catch (err) {
                //         console.error(err);
                //         res.status(500).send('Server error');
                //     }
                // });
                

// app.get('/profile', isLoggedIn, async (req, res) => {
//     const userId = req.user.id;

//     console.log(userId);
//     try {
//         // console.log(`Fetching profile for user ID: ${userId}`);

//         // Populate 'posts' field in the user object
//         console.log(await User.findById(userId));
//         const user = await User.findById(userId).populate('post').exec();

//         if (!user) {
//             console.log('User not found');
//             return res.status(404).send('User not found');
//         }

//         // console.log('User posts:', user.posts);

//         // Render profile with user data and posts
//         res.render('profile', { user });
//     } catch (err) {
//         console.error('Error fetching profile:', err);
//         res.status(500).send('Server error');
//     }
// });


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



// const hashPassword = async (password) => {
//     try {
//         const hashedPassword = await bcrypt.hash(password, saltRounds);
//         return hashedPassword;
//     } catch (err) {
//         console.error('Error hashing password:', err);
//         throw err;
//     }
// };

// const comparePassword = async (plainPassword, hashedPassword) => {
//     try {
//         const match = await bcrypt.compare(plainPassword, hashedPassword);
//         return match;
//     } catch (err) {
//         console.error('Error comparing password:', err);
//         throw err;
//     }
// };


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

//some issue with more then one response being send in case of wrong credential
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).send('Invalid credentials');
//         }

//         const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY);
//         res.cookie('username', token);
//         return res.redirect(`/profile/${user._id}`);
//     } catch (err) {
//         console.error('Login error:', err);
//         return res.status(500).send('Server error');
//     }
// });
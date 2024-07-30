require("dotenv").config();
const express = require("express")
const app = express()
const path = require("path")


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

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    image: String,
    username: String,
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array to keep track of users who liked the post
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;

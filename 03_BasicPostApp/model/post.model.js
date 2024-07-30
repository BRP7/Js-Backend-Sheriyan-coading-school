const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    image: String,
    username: String,
    content: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;

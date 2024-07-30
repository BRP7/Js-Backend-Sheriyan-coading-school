const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    post: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] // Reference to Post model
});

const User = mongoose.model('User', userSchema);

module.exports = User;

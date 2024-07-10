const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/mongopractice", {
  // Remove useNewUrlParser and useUnifiedTopology options
  // They are no longer needed and deprecated in newer versions
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    email: String
});

const User = mongoose.model("user", userSchema);

module.exports = User;

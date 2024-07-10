const express = require("express")
const User = require("./usermodel")
const app = express();

app.get('/',function(req,res){
    res.send("Hey");
})

app.get('/create',function(req,res){
    User.create({
        name:"harsh",
        email:"harsh@gmail.com",
        username:"harsh"
    })
})
app.get('/read',async function(req,res){
//    let users = await User.find();//gives u all user
//    let user = await User.find({username:"harsh"})//return [] on not finding match & on match [{}]
   let oneUser = await User.findOne({username:"harsh"})//return nothing on not finding match & on match {}
   res.send(oneUser);
})
app.get('/update',async function(req,res){
   let updatedUser = await User.findOneAndUpdate({username:"harsh"},{username:"harshvandanasharma"},{new:true})
   res.send(updatedUser);
})
app.get('/delete',async function(req,res){
   let deleteddUser = await User.findOneAndDelete({name:"harsh"})
   res.send(deleteddUser);
})


app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
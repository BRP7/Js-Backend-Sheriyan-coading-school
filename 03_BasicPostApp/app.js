const express = require("express")
const app = express()
const path = require("path")


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.get('/',function(req,res){
    res.send("Hello World!")
})

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});
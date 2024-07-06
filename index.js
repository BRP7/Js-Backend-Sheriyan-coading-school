const express = require('express');
const app = express();

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.get("/",function(req,res,next){
    res.send("welcome");
})

app.listen(3000);
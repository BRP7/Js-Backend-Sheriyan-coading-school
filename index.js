const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use('/files', express.static(path.join(__dirname, 'files')));

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"public")));

app.get("/",function(req,res,next){
    fs.readdir(`./files`,function(err,files){
        // console.log(files);//[]
        res.render("index",{files:files});
    })
})

app.post("/create",function(req,res,next){
    const title = req.body.title.trim();
    const details = req.body.details.trim();
    // console.log(req.body);
    if (!title || !details) {
        return res.status(400).send("Title and details are required.");
    }
  
    const sanitizedTitle = title.replace(/[^\w\s]/gi, '').split(" ").join('');

    fs.writeFile(`./files/${sanitizedTitle}.txt`, details, function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Failed to create task.");
        }
        res.redirect("/");
    });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// app.use('/files', express.static(path.join(__dirname, 'files')));

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
app.get("/file/:filename",function(req,res,next){
    
    // const sanitizedFilename = req.params.filename.replace(/[^\w\s]/gi, '').split(" ").join('');
    // console.log(sanitizedFilename);

    fs.readFile(`./files/${req.params.filename}`, "utf-8", function(err, fileData) {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading file.");
        }
        // console.log(fileData); 
        res.render("show",{ filename:req.params.filename, fileData: fileData }); 
    });
})
app.get("/edit/:filename",function(req,res){
        res.render("edit",{ filename:req.params.filename }); 
})
app.post("/edit",function(req,res){
     fs.rename(`files/${req.body.filename}`,`files/${req.body.new}`,function(err){
        res.redirect("/");
     }) 
})

app.post("/create",function(req,res){
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
//app is listening on port 3000
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
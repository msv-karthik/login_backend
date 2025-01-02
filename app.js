const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const port = 3000;
const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/login_be");
const collection = require("./init/index");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));
app.set('view engine','ejs');

connect.then(()=>{
    console.log("Database connected successfully");
})
.catch(()=>{
    console.log("Database cannot be connected");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.post("/signup",async (req,res)=>{
    const data = {
        name: req.body.username,
        password: req.body.password,
    }

    const existingUser = await collection.findOne({name: data.name});

    if(existingUser){
        res.send("User already exists. Please choose a different username.");
    } else{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password,saltRounds);
        data.password = hashedPassword;
        const userdata = await collection.insertMany(data);
        res.redirect("/login");
    }
});

app.get("/home",(req,res)=>{
    res.render("home");
});

app.post("/login", async (req,res)=>{
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check){
            res.send("User not found");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password,check.password);
        if(isPasswordMatch){
            res.render("home");
        }else{
            res.send("Incorrect credentials");
        }
    }catch{
        res.send("wrong details");
    }
});


app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
});
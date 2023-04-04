const express = require('express');
const connection = require("./config/db");
const cors = require("cors");
const UserModel = require('./models/user.model');
require('dotenv').config();


const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/" , (req,res) => {
    res.status(200).send("mock12 backend repo...");
})

app.post("/register" , async(req,res) => {
    let {name, email, password} = req.body;
    try {
        let users = await UserModel.find({email});
        if(users.length > 0){
            res.status(400).send({msg:"user with this email is already exist..."});
        }else{
            let newUser = new UserModel({name , email , password});
            await newUser.save();
            res.send({msg : "successfully sign up"});
        }
    } catch (error) {
        res.status(400).send({msg : "failed to signup..."});
    }
});

app.post("/login" , async(req , res) => {
    let {email , password} = req.body;
    try {
        let users = await UserModel.find({email});
        let user;
        if(users.length > 0){
            user = users[0];
            if(user.password === password){
                const token = jwt.sign({email : email} , `${process.env.KEY}`);
                res.status(200).send({msg : "login success" ,user, token});
            }else{
                res.status(400).send({msg: "wrong password..."});
            }
        }else{
            res.status(400).send({msg:"no user found with this email..."});
        }
        
    } catch (error) {
        
    }
});

app.get("/getprofile" , async(req, res) => {
    let token = req.headers.authorization;
    try{
        let {email} = jwt.verify(token , `${process.env.KEY}`);
        let users = await UserModel.find({email});
        if(users.length > 0){
            res.status(200).send({user : users[0]});
        }else{
            res.status(400).send({msg : "no user found"});
        }
    }catch(error){
        res.status(400).send({msg : "failed to get user..."});
    }
});

app.post("/calculate"  , async(req , res) => {
    let token = req.headers.authorization;
    let {AIA , AIR , TNY} = req.body;
    try {
        let {email} = jwt.verify(token , `${process.env.KEY}`);
        let users = await UserModel.find({email});
        if(users.length > 0){
            let TMV = (AIA*( ( (1+(AIR/100))**TNY ) - 1)/(AIR/100) ).toFixed(0);
            let TIA = (AIA*TNY).toFixed(0);
            let TIG = (TMV - TIA).toFixed(0);
            res.send({TMV ,TIA , TIG});
        }else{
            res.status(400).send({msg : "no user found"});
        }
    } catch (error) {
        res.status(400).send({msg : "failed to get data"});
    }
});


app.listen(8080 , async() => {
    try {
        await connection;
        console.log("successfully connected to DB...");
    } catch (error) {
        console.log("failed to connect with DB...");
    }
    console.log("server is successfully started at 8080");
});



// {
//     "name" : "rajparmar",
//     "email" : "raj@gmail.com",
//     "password" : "rajparmar",
//     "time" : "6547216544"
//   }
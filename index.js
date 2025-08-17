const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const JWT_secret = "random";  //don't share this
app.use(express.json());


//array to store users
const users = [];


function signup_handler(req, res){

    const username = req.body.username;
    const password = req.body.password;

    if(users.find(u => u.username === username)){
        res.json({
            message : "user alreaady exists"
        });
    }

    users.push({
        username : username,
        password : password
    })

    console.log(users); //logs the users

    res.json({
        message : "user signed up"
    });


}


function signin_handler(req, res){

    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(u => u.username === username && u.password === password)
    if(user){
        const token = jwt.sign({
            username : username
        },JWT_secret);//converts username to jwt
        res.header("jwt",token); //sendsthe jwt token to the header of signin request
    
        console.log(users);

        res.json({
            token : token
        });
    }

    else{
        res.status(403).send({
            message : "Invalid Username or Password" 
        })
    }

}


function auth(req, res, next){

    const token = req.get("Authorization"); //.get IS  A HELPER FUNCTION and the line sends  jwt
    // const token = req.headers['authorization'];  YOU CAN ALSO USE THIS IT DIRECTLY ACCESSESS THE HEADERS
    const decodedData = jwt.verify(token, JWT_secret);
    if(decodedData.username){
        req.username = decodedData.username;
        next()
    }
    else{
        res.json({
            message : "please signin"
        });
    }

}


function logger(req, res, next){
    console.log(req.method +" request came");
    next();
}


function my_info(req, res){
    // const token = req.get("Authorization"); //.get IS  A HELPER FUNCTION and the line sends  jwt
    // // const token = req.headers['authorization'];  YOU CAN ALSO USE THIS IT DIRECTLY ACCESSESS THE HEADERS
    // const documentInformation = jwt.verify(token, JWT_secret);
    // const username = documentInformation.username;

    const user = users.find(u => u.username === req.username)

    if(user){
        res.json({
            username : user.username,
            password : user.password
        });
    }

    else{
        res.json({
            message : "Invalid Token"
        });
    }
    console.log(users);
}


app.get("/", function(req, res){
    res.sendFile(__dirname+"/public/index.html")
})

app.post("/signup",logger, signup_handler)
app.post("/signin", logger, signin_handler)
app.get("/me", logger, auth, my_info)


app.listen(3000,() =>{
    console.log("Server running at http://localhost:3000");
});
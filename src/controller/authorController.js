const jwt = require("jsonwebtoken");
const authorModel = require('../model/authorModel')


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};

//using regex for validation mail

const validateEmail = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
};

// Validations for fname, lname

const regex = /\d/;
const isVerifyString = function (string) {
    return regex.test(string)
};

//creating author api 

const createAuthor = async (req, res) => {
    try {
        let data = req.body

        let arrKeys = Object.keys(data);
        if (arrKeys.length == 0) return res.status(400).send({ status: true, msg: "Data is required" })
        //  checking that required key is present or not
        if (!data.fname) return res.status(400).send({ status: false, msg: "fname is required" })
       
        if (!data.lname) return res.status(400).send({ status: false, msg: "lname is required" })
        if (!data.title) return res.status(400).send({ status: false, msg: "title is required" })
        if (!data.email) return res.status(400).send({ status: false, msg: "email is required" })
        if (!data.password) return res.status(400).send({ status: false, msg: "password is required" })

        //  checking if any field is empty or send data with space 
        if (!isValid(data.fname)) return res.status(400).send({ status: false, msg: "invalid fName" })
        if (!isValid(data.lname)) return res.status(400).send({ status: false, msg: "invalid lName" })
        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "invalid title" })
        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "email should not be empty" })
        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "invalid password" })

        // email format is valid or not by using isVerifyString()
        if (!validateEmail(data.email)) return res.status(400).send({ status: false, msg: "invalid email" })
        // fname and lname and title is proper syntax if digit contains 
        if (isVerifyString(data.fname)) return res.status(400).send({ status: false, msg: "fname doesn't contains any digit" })
        if (isVerifyString(data.lname)) return res.status(400).send({ status: false, msg: "lname doesn't contains any digit" })
        if (isVerifyString(data.title)) return res.status(400).send({ status: false, msg: "title doesn't contains any digit" })

        // Email is unique or not
        let isUniqueEmail = await authorModel.findOne({ email: data.email })
        if (isUniqueEmail) return res.status(400).send({ status: false, msg: "email is already exits" })

        // title contains right value or not   enum: ["Mr", "Mrs", "Miss"]
        let arr = ["Mr", "Mrs", "Miss"]
    
        if (!arr.includes(data.title)) return res.status(400).send({ status: false, msg: "This is not valid value for title.You should try to same formate [Mr, Mrs, Miss]" })

     

        // everyting is fine then create data in database and send the responce with satatus 201
        let created = await authorModel.create(data)
        res.status(201).send({ status: true, data: created })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const login = async function (req, res) {
    try{
    let email = req.body.email;
    let password = req.body.password;
  
    let user = await authorModel.findOne({ email: email, password: password });
    if (!user)
      return res.status(401).send({
        status: false,
        msg: "Invalid Login credentials",
      });
  
    // if successfull login then create a token 
    let token = jwt.sign(
      {
        authorId: user._id.toString(),
        iat:Math.floor(Date.now() / 1000),
        exp:Math.floor(Date.now() / 1000) + 10*60*60
      },
      "project1"
    );
    // if token cretead then set it in header and send in the response
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, token: token });
    }catch(error){
      return res.status(500).send({satus:false,msg:error.message})
    }
  }


module.exports = { createAuthor, login}
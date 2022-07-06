const blogModel = require("../model/blogModel")
const authorModel = require("../model/authorModel")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidString = function (value) {
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};


//Creating blogs

let createBlog = async function (req, res) {
  try {

      let data = req.body;
      let authorId = data.authorId

      //  checking that required key is present or not
      if (!data.title) return res.status(400).send({ status: false, msg: "Title tag is required" })
      if (!data.body) return res.status(400).send({ status: false, msg: "body tag is required" })
      if (!data.category) return res.status(400).send({ status: false, msg: "category tag is required" })
      if (!data.authorId) return res.status(400).send({ status: false, msg: "authorId tag is required" })

      // here we are checking that if any field is empty or send data with space 
      if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "title is not empty" })
      if (!isValid(data.body)) return res.status(400).send({ status: false, msg: "body is not empty" })
      if (!isValid(data.category)) return res.status(400).send({ status: false, msg: "category is not empty" })
      if (!isValid(data.authorId)) return res.status(400).send({ status: false, msg: " authorId is not empty" })

      // Author id format is valid or not
      if (!mongoose.Types.ObjectId.isValid(authorId)) return res.status(400).send({ status: false, mess: "Please enter a valid id " })

      // this authorId is present in our db or not
      let isExistsAuthorId = await authorModel.findById(authorId)

      // create blog with real author id 
      let token = req.headers["x-api-key"];
      let decodedToken = jwt.verify(token, "project1")

      let logginUserAuthorId = decodedToken.authorId
      if (logginUserAuthorId != authorId) return res.status(403).send({ status: false, msg: "You are not autherized to create blog with another id" })
      // send the error mess if authorId is not present in db
      if (!isExistsAuthorId) return res.status(400).send({ status: false, msg: "Author doesn't exists" })

      // everyting is fine then create data in database and send the responce with satatus 201
      let newBlogObject = await blogModel.create(data)
      res.status(201).send({ status: true, data: newBlogObject })

  } catch (error) {
      res.status(500).send({ status: false, msg:error.message })
  }
};

//Get blogs

const getBlogs = async function (req, res) {

  try {

    let data = req.query 

    if (!isValidString(data.authorId)) {
      return res.status(400).send({ status: false, msg: "AuthorId is Required" })
    }
    if(data.authorId){

    if (!mongoose.isValidObjectId(data.authorId)) {
      return res.status(400).send({ status: false, msg: "Enter a Valid AuthorId"})
    }
    
    let AuthorData = await authorModel.findById(data.authorId) 
    
    if (!AuthorData) {
      return res.status(404).send({ status: false, msg: "No such authorId found" })
    }
   
    if (!isValidString(data.category)) {
      return res.status(400).send({ status: false, msg: "category is Required" })
    }
    if(data.category){
      let category=data.category.split(",").map((x)=>(x.trim()))
      data.category=category
    }
    
    if (!isValidString(data.subcategory)) {
      return res.status(400).send({ status: false, msg: "subcategory is Required" })
    }
    if(data.subcategory){
      let subcategory=data.subcategory.split(",").map((x)=>(x.trim()))
      data.subcategory=subcategory
    }

    if (!isValidString(data.tags)) {
      return res.status(400).send({ status: false, msg: "tags is Required" })
    }
    if(data.tags){
      let tags=data.tags.split(",").map((x)=>(x.trim()))
      data.tags=tags
    }
    
    let blogData = await blogModel.find({ $and: [data, { isDeleted: false }, { isPublished: true }] }).populate("authorId")
    
    if (!blogData.length) {
      return res.status(400).send({ status: false, msg: "No such blog exists" })
    }
    
    res.status(200).send({ status: true, data: blogData })
  }
  } catch (err) {
    
    res.status(500).send({ status: false, msg: err.message });
  
  }
};


//update blogs


const updateBlog = async function (req, res) {

  try {

    let data = req.body 
    let blog_Id = req.params.blogId 

    if (!Object.keys(data).length) {
      return res.status(400).send({ status: false, msg: "input can't be empty" })
    }
    
    if (!isValidString(data.title)) {
      return res.status(400).send({ status: false, msg: "tags is Required" })
    }

    if (!isValidString(data.body)) {
      return res.status(400).send({ status: false, msg: "body is Required" })
    }

    if (!isValidString(data.subcategory)) {
      return res.status(400).send({ status: false, msg: "SubCategory is Required" })
    }
    if(data.subcategory){
      let subcategory=data.subcategory.split(",").map((x)=>(x.trim()))
    data.subcategory=subcategory
    }

    if (!isValidString(data.tags)) {
      return res.status(400).send({ status: false, msg: "tags is Required" })
    }
    if(data.tags){
      let tags=data.tags.split(",").map((x)=>(x.trim()))
    data.tags=tags
    }

    let checkBlog = await blogModel.findById(blog_Id)  

    if(!checkBlog) {
      return res.status(404).send({ status: false, msg: "Blog Not Found" })
    }

    if (checkBlog.isDeleted == true) {
      return res.status(400).send({ status: false, msg: "This blog is already Deleted" })
    }
    
    let update = await blogModel.findByIdAndUpdate(blog_Id,

      { $push:{tags:data.tags,subcategory:data.subcategory},title:data.title,body:data.body,isPublished: true, publishedAt: new Date()  },
      
      { new: true })
   
    res.status(200).send({ status: true, data: update })

  }

  catch (err) {

    res.status(500).send({ error: err.message })

  }
}

//Delete blogs by path params

const deleteBlog = async function (req, res) {

  try {

    let blog_Id = req.params.blogId; 

    let checkBlog = await blogModel.findById(blog_Id)
    
    if(!checkBlog) {
      return res.status(404).send({ status: false, msg: "Blog Not Found" })
    }

    if (checkBlog.isDeleted == true) {
      return res.status(400).send({ status: false, msg: "this blog is already deleted" })
    }
    
    let deletedBlog = await blogModel.findOneAndUpdate(
    
      { _id: blog_Id },
    
      { $set: { isDeleted: true ,DeletedAt:Date.now()} },
    
      { new: true });

      if (deletedBlog.modifiedCount==0) {
        return res.status(400).send({ status: false, msg: "No Blog Document Exists" })
      }

      res.status(200).send({ status: true, data: deletedBlog });
  }

  catch (err) {
   
    res.status(500).send({ msg: "error", error: err.message })
  
  }
}

//Delete blogs by query params

const deleteByQuery = async function (req, res) {

  try {

    let data = req.query; 

      const deleteByQuery = await blogModel.updateMany(

      { $and: [data, { isDeleted: false }] },

      { $set: { isDeleted: true ,DeletedAt:new Date()} },

      { new: true })

      if (deleteByQuery.modifiedCount==0) {
        return res.status(400).send({ status: false, msg: "The Blog is already Deleted" })
      }

      res.status(200).send({ status: true, msg: deleteByQuery })
  }

  catch (err) {

    res.status(500).send({ error: err.message })

  }
}

module.exports={createBlog,getBlogs,updateBlog,deleteBlog,deleteByQuery}


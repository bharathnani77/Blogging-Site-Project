const express=require('express')
const router = express.Router()
const authorController=require('../controller/authorController')
const blogController=require('../controller/blogController')
const middleWare=require('../middleware/mw')

router.post('/authors',authorController.createAuthor);

router.post('/login',authorController.login);

router.post('/blogs',blogController.createBlog);

router.get('/blogs',middleWare.Authentication,blogController.getBlogs);

router.put('/blogs/:blogId',middleWare.Authentication,middleWare.Authorisation,blogController.updateBlog)

router.delete('/blogs/:blogId',middleWare.Authentication,middleWare.Authorisation,blogController.deleteBlog)

router.delete('/blogs',middleWare.Authentication,middleWare.AuthorisationForQuery,blogController.deleteByQuery)

module.exports=router
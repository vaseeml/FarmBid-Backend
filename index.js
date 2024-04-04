require('dotenv').config()
const express = require('express')
app.use(express.json())
const cors = require('cors')
app.use(cors())

const app = express()
const path = require('path')
const multer = require('multer')
const configureDB = require('./config/db')
const {checkSchema} = require('express-validator')
const { authenticateUser, authorizeUser } = require('./app/middlewares/auth')
const {userRegisterSchema, userLoginSchema} = require('./app/validations/userValidationSchema')
const productCreateSchema = require('./app/validations/productValidationSchema')
const walletValidationSchema = require('./app/validations/walletValidationSchema')
const profileValidationSchema = require('./app/validations/profileValidationSchema')
const walletCtrl = require('./app/controllers/wallet-controller')
const productCtrl = require('./app/controllers/product-controller')
const profileCtrl = require('./app/controllers/profile-controller')
const userCtrl = require('./app/controllers/user-controller')
configureDB()
const storage = multer.diskStorage({
    destination:(req ,file , cb)=>{
        if(file.fieldname=='profilePhoto' && file.mimetype.startsWith('image')){
            cb(null,'./app/files/profileImages')
        }
        else if(file.mimetype.startsWith('video')){
            cb(null , './app/files/videos')
        }else if(file.mimetype.startsWith('image')){
            cb(null , './app/files/images')
        }else{
            cb(new Error('invalid file type'))
        }
    },
    filename:(req , file , cb)=>{
        cb(null , `${Date.now()}-${file.originalname}`)
    }
})
// Serve static files from the 'file' directory
app.use('/vidos', express.static(path.join(__dirname, 'videos')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/profileImages', express.static(path.join(__dirname, 'profileImages')));
const upload = multer({storage:storage})

//api requests

app.post('/api/register' ,checkSchema(userRegisterSchema),userCtrl.register )
app.post('/api/login' , checkSchema(userLoginSchema),userCtrl.login)
app.post('/api/profile',authenticateUser,authorizeUser(['seller','buyer']),upload.single('profilePhoto'),checkSchema(profileValidationSchema),profileCtrl.create)
app.put('/api/profile/:id',authenticateUser,authorizeUser(['seller','buyer']),upload.single('profilePhoto'),profileCtrl.edit)
app.get('/api/profile',authenticateUser,authorizeUser(['seller','buyer']),profileCtrl.account)

app.post('/api/create/product' , authenticateUser , authorizeUser(['seller']),upload.fields([{name:'productImg' ,maxCount:3 }, {name: 'productVideo', maxCount:1}]) , checkSchema(productCreateSchema) ,  productCtrl.create)
app.get('/api/vegetables' , productCtrl.list) // common request for all before loggedIn
app.get('/api/list/vegetables' , authenticateUser , authorizeUser(['buyer']) , productCtrl.list) // api for buyer to see all the vegetables listing
app.get('/api/vegetables/my' , authenticateUser , authorizeUser(['seller']), productCtrl.myVeg) // api for seller to see thier own posted vegetables
app.delete('/api/delete/:id' , authenticateUser, authorizeUser(['seller']) , productCtrl.destroy)
app.put('/api/update/:id' , authenticateUser , authorizeUser(['seller']), upload.fields([{name:'productImg' , maxCount:3},{name:'productVideo', maxCount:1}]), checkSchema(productCreateSchema) , productCtrl.update)


app.put('/api/wallet/:id/credit' , authenticateUser , authorizeUser(['buyer']),checkSchema(walletValidationSchema) ,walletCtrl.update )
app.get('/api/wallet/:id' , walletCtrl.show )
app.listen(port , ()=>{
    console.log('server is running successfully on port ' , port)
})
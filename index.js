require('dotenv').config()
const express = require('express')
const cors = require('cors')
const port = 3000
const app = express()
app.use(cors())
app.use(express.json())
const configureDB = require('./config/db')
const {checkSchema} = require('express-validator')
const userCtrl = require('./app/controllers/user-controller')
const {userRegisterSchema, userLoginSchema} = require('./app/validations/userValidationSchema')
const { authenticateUser, authorizeUser } = require('./app/middlewares/auth')
const multer = require('multer')
configureDB()
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        let uploadPath='./app/files/'
        if (file.mimetype.startsWith('video')) {
            uploadPath += 'videos/';
        }else {
            return cb(new Error('Invalid file type'));
        }
        cb(null,uploadPath)
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload=multer({storage:storage})
app.post('/api/register' ,checkSchema(userRegisterSchema),userCtrl.register )
app.post('/api/login' , checkSchema(userLoginSchema),userCtrl.login)
app.post('/api/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully');
  });

app.get('/api/vegetables' , authenticateUser , authorizeUser(['buyer']) , ()=>{
    console.log('all the vegetables')
})
app.listen(port , ()=>{
    console.log('server is running successfully on port ' , port)
})
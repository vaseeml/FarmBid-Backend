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
configureDB()

app.post('/api/register' ,checkSchema(userRegisterSchema),userCtrl.register )
app.post('/api/login' , checkSchema(userLoginSchema),userCtrl.login)

app.get('/api/vegetables' , authenticateUser , authorizeUser(['buyer']) , ()=>{
    console.log('all the vegetables')
})
app.listen(port , ()=>{
    console.log('server is running successfully on port ' , port)
})
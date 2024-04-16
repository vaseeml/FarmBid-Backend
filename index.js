require('dotenv').config()
const express = require('express')
const socketIO = require('socket.io')
const http = require('http')
const cors = require('cors')
const port = process.env.PORT || 3999
const app = express()
const path = require('path')
const configureDB = require('./config/db')
app.use(cors({
    origin:'http://localhost:3001',
    methods:['GET' , 'POST'],
    credentials:true
}))
app.use(express.json())
const bidCtrl = require('./app/controllers/bid-controller')
// Create an HTTP server using the Express app
const server = http.createServer(app)

// Create a Socket.IO instance by passing the HTTP server
const io = socketIO(server,{
    cors:{
        origin:'http://localhost:3001',
        methods:['GET' , 'POST'],
        credentials:true
    }
})


// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Join a private room when the client requests to join a product
    socket.on('joinProductRoom', (productId) => {
        // Leave any existing rooms
        socket.leaveAll();
        // Join the room associated with the product
        socket.join(productId);
        console.log(`Client ${socket.id} joined room for product ${productId}`);
    });
  
  
    // Handle bid update event
    socket.on('bidUpdate', (bidUpdateData) => {
      // Process bid update data
      // Broadcast bid update to all connected clients
      io.emit('updatedBid', bidUpdateData);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  

const multer = require('multer')

const { authenticateUser, authorizeUser } = require('./app/middlewares/auth')

// Requiring Schema Validations
const userCtrl = require('./app/controllers/user-controller')
const productCtrl = require('./app/controllers/product-controller')
const walletCtrl = require('./app/controllers/wallet-controller')
const profileCtrl = require('./app/controllers/profile-controller')
const paymentsCtrl = require('./app/controllers/payment-controller')

const {orderCtrl}=require('./app/controllers/order-controller')

const cartCtrl = require('./app/controllers/cart-controller')



// Requiring Schema Validations
const {checkSchema} = require('express-validator')
const {userRegisterSchema, userLoginSchema} = require('./app/validations/userValidationSchema')
const productCreateSchema = require('./app/validations/productValidationSchema')
const walletValidationSchema = require('./app/validations/walletValidationSchema')
const profileValidationSchema = require('./app/validations/profileValidationSchema')
const paymentsValidationSchema = require('./app/validations/paymentValidationSchema')
const otpCtrl = require('./app/controllers/otp-controller')
const cartValidationSchema = require('./app/validations/cartValidationSchema')

configureDB()

// multer storage
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
// app.use('/app/files/videos', express.static(path.join(__dirname, 'app/files/vidoes')));
app.use('/app/files', express.static(path.join(__dirname, 'app/files')));
app.use('/profileImages', express.static(path.join(__dirname, 'profileImages')));
const upload = multer({storage:storage})

//api requests for users
app.post('/api/register' ,checkSchema(userRegisterSchema),userCtrl.register )
app.post('/api/login' , checkSchema(userLoginSchema),userCtrl.login)
app.post('/api/update/password' , userCtrl.update)

//api requests for profile
app.post('/api/profile',authenticateUser,authorizeUser(['seller','buyer']),upload.single('profilePhoto'),checkSchema(profileValidationSchema),profileCtrl.create)
app.put('/api/profile/:id',authenticateUser,authorizeUser(['seller','buyer']),upload.single('profilePhoto'),profileCtrl.edit)
app.get('/api/profile',authenticateUser,authorizeUser(['seller','buyer']),profileCtrl.account)

// api requests for product(vegetables)
app.post('/api/create/product' , authenticateUser , authorizeUser(['seller']),upload.fields([{name:'productImg' ,maxCount:3 }, {name: 'productVideo', maxCount:1}]) , checkSchema(productCreateSchema) ,  productCtrl.create)
app.get('/api/products' , productCtrl.list) // common request for all before loggedIn
app.get('/api/products/live',authenticateUser,authorizeUser(['seller','buyer']),productCtrl.getLive)
app.get('/api/products/completed',authenticateUser,authorizeUser(['seller','buyer']),productCtrl.getCompleted)
app.get('/api/list/products' , authenticateUser , authorizeUser(['buyer']) , productCtrl.list) // api for buyer to see all the vegetables listing
app.get('/api/products/my' , authenticateUser , authorizeUser(['seller']), productCtrl.myVeg) // api for seller to see thier own vegetables porducts
app.delete('/api/delete/:id' , authenticateUser, authorizeUser(['seller']) , productCtrl.destroy)
app.put('/api/update/:id' , authenticateUser , authorizeUser(['seller']), upload.fields([{name:'productImg' , maxCount:3},{name:'productVideo', maxCount:1}]), checkSchema(productCreateSchema) , productCtrl.update)

//api requests for wallet
app.put('/api/wallet/:id/credit' , authenticateUser , authorizeUser(['buyer']),checkSchema(walletValidationSchema) ,walletCtrl.update )
app.get('/api/wallet', authenticateUser, walletCtrl.show )

//api requests for payment
app.post('/api/create-checkout-session' ,checkSchema(paymentsValidationSchema), paymentsCtrl.pay)
app.put('/api/success-update/:id' ,checkSchema(paymentsValidationSchema), paymentsCtrl.successUpdate)
app.put('/api/failed-update/:id' ,checkSchema(paymentsValidationSchema), paymentsCtrl.failedUpdate)

// api requests for bids
app.post('/api/bid' , authenticateUser , authorizeUser(['buyer']) , (req , res)=>{
    bidCtrl.newBid(io , req ,res)
})


// api requests for orders
app.get('/api/orders',authenticateUser,authorizeUser(['seller','buyer']), orderCtrl.list)

//api requests for otp
app.post('/api/send-otp',otpCtrl.create)
app.post('/api/verify-otp',otpCtrl.verify)

// api for cart system
app.get('/api/cart' , authenticateUser , authorizeUser(['buyer']) , cartCtrl.list)
app.post('/api/cart' , authenticateUser , authorizeUser(['buyer']) ,checkSchema(cartValidationSchema) , cartCtrl.create)
app.delete('/api/cart/:id', authenticateUser , authorizeUser(['buyer']) , cartCtrl.destroy)


server.listen(port , ()=>{
    console.log('server is running successfully on port ' , port)
})
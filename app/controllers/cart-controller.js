const cron = require('node-cron')
const { validationResult } = require('express-validator')
const Cart = require('../models/cart-model')
const Product = require('../models/product-model')
const User = require('../models/user-model')
const nodemailer = require('nodemailer')
const cartCtrl = {}

cartCtrl.list = async(req ,res)=>{
    try{
        const carts = await Cart.find({user:req.user.id}).populate('product')
        res.json(carts)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
cartCtrl.create = async(req ,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const {body} = req
        const productInCart = await Cart.findOne({product:body.product})
        if(productInCart){
            return res.status(400).json({error:'Product Is Already In Cart!'})
        }
        const cart = new Cart(body)
        cart.user = req.user.id
        await cart.save()
        cronJob(cart)
        res.status(201).json(cart)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

cartCtrl.destroy = async(req ,res)=>{
    const { id } = req.params
    try{
        const cart = await Cart.findByIdAndDelete(id)
        res.json(cart)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

module.exports = cartCtrl

// scheduling the cron job
const cronJob =async (cart)=>{
    try{
        const product = await Product.findById(cart.product)
        const user = await User.findById(cart.user)
        if(product){
            const biddingStart = new Date(product.biddingStart)
            const cronPattern = `${biddingStart.getSeconds()} ${biddingStart.getMinutes()} ${biddingStart.getHours()} ${biddingStart.getDate()} ${biddingStart.getMonth() + 1} *`
            cron.schedule(cronPattern , ()=>{
                sendMail(user , product)
            })
        }
    } catch(err){
        console.log(err)
    }
}

// sending the mail to user
const sendMail = (user , product)=>{
    const transporter = nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user:process.env.Email,
            pass:process.env.Pass
        }
    })
    const pageUrl = `http://localhost:3001/live/${product._id}/bid`
    const mailOptions = {
        from:process.env.Email,
        to:user?.email,
        subject:'Bidding Start Notification',
        html:`<p>Bidding Started For Your Cart Product <strong>${product.productName}</strong> At ${new Date(product.biddingStart)}
         Click On The Link To Start Bidding <p><a href="${pageUrl}">Click here</a></p>`
    }
    transporter.sendMail(mailOptions , (error , info )=>{
        if(error){
            console.log('error occured while sending mail to user name: ', user.username , error)
        } else{
            console.log('email sent: ', info.response)
        }
    })
}
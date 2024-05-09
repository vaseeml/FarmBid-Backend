const { validationResult } = require("express-validator")
const Wallet = require("../models/wallet-model")
const _ = require('lodash')
const Bid = require("../models/bid-model")
const Order = require("../models/order-model")
const Product = require("../models/product-model")

const walletCtrl = {}

walletCtrl.update = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body = _.pick(req.body , ['balance'])
    try{
        // finding wallet 
        const wallet = await Wallet.findOne({userId:req.user.id})
        // returning user if not found
        if(!wallet){
            return res.status(404).json({error:'Wallet Not Found'})
        }
        //updating wallet balance with new Add balance
        const newBalance = wallet.balance + Number(body.balance)
        // updating to model
        const updateWallet = await Wallet.findOneAndUpdate({_id:wallet._id}, {balance:newBalance} , {new:true})
        res.json(updateWallet)
    }catch(err){
        console.log(err) 
        res.status(500).json({error:'Internal Server Errors'})
    }
}
walletCtrl.show = async(req, res)=>{
    try{
        // finding wallet to show user
        const wallet = await Wallet.findOne({userId:req.user.id}).populate('userId' , ['username' , 'phone' , 'email' , 'role'])
        res.json(wallet)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

walletCtrl.transactions = async(req ,res)=>{
    const page = req.query.page || 1
    const limit = req.query.limit || 5
    try{
        if(req.user.role == 'buyer'){
            const transactions = await Bid.find({bidderId:req.user.id}).populate('productId')
            .skip((page - 1)* limit)
            .limit(limit)
            res.json(transactions)
        }
        if(req.user.role == 'seller'){
            const products = await Product.find({sellerId:req.user.id , biddingStatus:'closed' })
            const productsIds = products.map(ele=>ele._id)
            const transactions = await Order.find({product:productsIds})
            .skip((page - 1)* limit)
            .limit(limit)
            .populate('bidder' , ['username' , 'email' , 'phone']).populate('product' , ['basePrice' , 'productName'])
            res.json(transactions)
        }
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
module.exports = walletCtrl
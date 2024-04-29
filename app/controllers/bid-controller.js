const Bid = require('../models/bid-model')
const Product = require('../models/product-model')
const Wallet = require('../models/wallet-model')
const _ = require('lodash')
const cron = require('node-cron')
const {createOrder} = require('./order-controller')
const bidCtrl = {}

bidCtrl.newBid = async(io ,req ,res )=>{
    // pick releated fields 
    const body = _.pick(req.body , ['amount' , 'productId'])
    // checking if amount and productId is present 
    if(!body.amount && !body.productId){
        return res.status(400).json({error:'Invalid Data'})
    }
    try{
        // finding the product and updating the biddingEnd time for first bid ,checking biddingStatus
        const product = await Product.findOne({_id:body.productId , biddingStatus:'open'})
        if(!product){
            return res.status(403).json({error:'Bidding Closed For This Product'})
        }
        // creating new intance of bid
        if(body.amount <= product.basePrice){
            return res.status(400).json({error:'Bid price should be greater than base price of product'})
        }
        const bid = new Bid(body)
        bid.bidderId = req.user.id
        bid.amount = Number(body.amount)
        // finding wallet with userId
        const newBidderWallet = await Wallet.findOne({userId:req.user.id})
        
        // if not returning the user
        if(!newBidderWallet){
            return res.status(404).json({error:'Wallet Not Found'})
        }
        //checking if wallet balance is lessthan bid amount
        if(newBidderWallet.balance < Number(body.amount)){
            return res.status(400).json({error:'Insufficiant Balance To Bid'})
        }
        // updating the previous bid status 
        const updateStatus = await Bid.findOne({productId:body.productId ,status:'Active'})
        // checking previous bid amount with new bid amount
        if(updateStatus?.amount >= Number(body.amount)){
            return res.status(400).json({error:'Invalid Bid Amount/Previous Bid Amount'})
        }
        if(updateStatus){  
            const wallet = await Wallet.findOne({userId:updateStatus.bidderId})
            if(wallet){
                wallet.balance += updateStatus.amount
                await wallet.save()
            }
            updateStatus.status = 'Lost'
            // saving the previous bid record
            await updateStatus.save()
        }
        // debiting balance amount of current bidder
        newBidderWallet.balance -= Number(body.amount)
        //update the new bidder wallet
        await newBidderWallet.save()
        //saving new bidder record
        await bid.save()
        if(product && !product.biddingEnd){
            const currentTime = new Date()
            currentTime.setMinutes(currentTime.getMinutes() + 10)
            product.biddingEnd = currentTime
            await product.save()
        }
        const populatedBid = await Bid.findById(bid._id).populate('bidderId' , ['username', 'email', 'phone', 'role'])
        io.to(body.productId).emit('newBid',populatedBid)
        res.status(201).json(bid)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

bidCtrl.bidsOnProduct = async(req, res)=>{
    const id = req.params.id
    try{
        const bidsOnProduct = await Bid.find({productId:id}).populate('bidderId' , ['username' , 'role' , 'email' , 'phone'])
        console.log('seller' , bidsOnProduct)
        res.json(bidsOnProduct)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

bidCtrl.chartBids = async (req , res)=>{
    const search = req.query.search || ''
    try{
        const products = await Product.find({productName:{$regex:search , $options:'i'}})
        const productIds = products.map(product => product._id)
        const bids = await Bid.find({productId:{ $in: productIds }})
        res.json(bids)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

bidCtrl.list = async(req ,res)=>{
    const id = req.params.id
    try{
        const bids = await Bid.find({bidderId:id}).populate('bidderId' ,['username' , 'role' , 'email' , 'phone'] ).populate('productId')
        res.json(bids)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
bidCtrl.all = async(req ,res)=>{
    try{
        const bids = await Bid.find().populate('productId')
        res.json(bids)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
const checkBiddingStatus = async()=>{
    console.log('checking every minute')
    try{
        const currentTime = new Date()
        const products = await Product.find({biddingEnd:{$lte:currentTime} ,biddingStatus:'open' })
        console.log(products)
        for(const product of products){
           const lastBid = await Bid.findOne({productId:product._id}).populate('productId', ['sellerId']).sort({createdAt:-1}).exec()
           if(lastBid){
                lastBid.status = 'Finished'
                lastBid.winner = true
                product.biddingStatus = 'closed'
                await product.save()
                await lastBid.save()
                await createOrder(lastBid)
           }else{
            console.log('No Product Is Found For ' , product._id)
           }
        }
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
    try {
      await checkBiddingStatus()
    } catch (error) {
      console.error('Error occurred while checking bidding status:', error)
    }
})
module.exports = bidCtrl
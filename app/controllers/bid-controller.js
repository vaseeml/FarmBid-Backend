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
            const currentTime = Date.now()
            currentTime.setMinutes(currentTime.getMinutes() + 10)
            product.biddingEnd = currentTime
            await product.save()
        }
        io.to(body.productId).emit('newBid',bid)
        res.status(201).json(bid)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

const checkBiddingStatus = async(req , res)=>{
    try{
        const currentTime = Date.now()
        const products = await Product.find({biddingEnd:{$lte:currentTime}})
        for(const product of products){
           const lastBid = await Bid.findOne({productId:product._id}).sort({createdAt:-1}).exec()
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
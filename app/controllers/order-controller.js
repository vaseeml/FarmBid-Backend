const Bid=require('../models/bid-model')
const Order=require('../models/order-model')
const Product=require('../models/product-model')
const Wallet = require('../models/wallet-model')
const handleSocketUpdates = require('../../index')
const orderCtrl={}
orderCtrl.list=async(req,res)=>{
    try{
        if(req.user.role=='seller'){
            const products = await Product.findOne({sellerId:req.user.id})
            const productsId = products.map(ele=>ele._id)
            const orders = await Order.find({product:productsId})
            res.json(orders)
        }else if(req.user.role=='buyer'){
            const bids=await Bid.findOne({bidderId:req.user.id})
            const bidsId = bids.map(ele=>ele._id)
            const orders = await Order.find({bidder:bidsId})
            res.json(orders)
        }else {
            res.status(400).json({ error: 'Invalid user role' });
        }
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

orderCtrl.buyerInfo = async(req, res)=>{
    const id = req.params.id
    try{
        const order = await Order.findOne({product:id}).populate('bidder' , ['username' , 'phone' , 'email'])
        res.json(order)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
const createOrder=async(lastBid)=>{
    try{
        const productOrder = await Order.findOne({product:lastBid.productId?._id})
        if(!productOrder){
            const order=new Order({
                product:lastBid.productId?._id,
                bidder:lastBid.bidderId,
                bidAmount:lastBid.amount
            })
            const wallet = await Wallet.findOne({userId:lastBid.productId?.sellerId})
            if(!wallet){
                res.status(404).json({error:'seller wallet is not found'})
            }
            wallet.balance += lastBid.amount
            await wallet.save()
            await order.save()
            const idPrev = (lastBid?.bidderId)?.toString()
            handleSocketUpdates(idPrev , {productId:lastBid.productsId?._id , bidAmount:lastBid.amount})
            // io.to(idPrev).emit('bidWon' , {productId:lastBid.productId?._id , bidAmount:lastBid.amount})
            console.log('Order created successfully:', order)
        }
        console.log('order already placed')
    }catch(err){
        console.log(err)
    }
}
module.exports={orderCtrl,createOrder}
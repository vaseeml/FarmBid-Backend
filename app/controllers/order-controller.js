const Bid=require('../models/bid-model')
const Order=require('../models/order-model')
const Product=require('../models/product-model')
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
const createOrder=async(lastBid)=>{
    try{
        const order=new Order({
            product:lastBid.productId,
            bidder:lastBid.bidderId,
            bidAmount:lastBid.amount
        })
        await order.save()
        console.log('Order created successfully:', order)
    }catch(err){
        console.log(err)
    }
}
module.exports={orderCtrl,createOrder}
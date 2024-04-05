const {Schema,model}=require('mongoose')
const orderSchema=new Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    bidder:{
        type:Schema.Types.ObjectId,
        ref:'Bid'
    },
    bidAmount:Number
})
const Order=model('Order',orderSchema)
module.exports=Order
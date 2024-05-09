const {Schema,model}=require('mongoose')
const orderSchema=new Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    bidder:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    bidAmount:Number
}, {timestamps:true})
const Order=model('Order',orderSchema)
module.exports=Order
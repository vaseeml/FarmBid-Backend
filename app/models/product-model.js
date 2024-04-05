const {Schema , model } = require('mongoose')

const productSchema = new Schema({
    sellerId:{
        type:Schema.Types.ObjectId, 
        ref:'User'
    },
    productName:String ,
    productImg:String,
    productVideo:String,
    basePrice:String,
    stock:String,
    weight:String,
    address:String,
    biddingStart: { type: Date, required: true },
    biddingEnd: Date ,
    biddingStatus: { type: String, enum: ['open', 'closed'], default: 'open' }
},{timestamps:true})

const Product = model('Product' , productSchema)

module.exports = Product
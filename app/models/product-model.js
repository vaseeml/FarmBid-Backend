const {Schema , model } = require('mongoose')

const productSchema = new Schema({
    productName:String ,
    productImg:String,
    productVideo:String,
    basePrice:String,
    stock:String,
    weight:String,
    address:String
},{timestamps:true})

const Product = model('Product' , productSchema)

module.exports = Product
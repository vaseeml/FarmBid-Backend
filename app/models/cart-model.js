const { Schema , model } = require('mongoose')

const cartSchema = new Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
}, {timestamps:true})

const Cart = model('Cart' , cartSchema)

module.exports = Cart
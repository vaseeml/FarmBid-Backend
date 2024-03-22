const {Schema , model} = require('mongoose')

const walletSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    balance:{
        type:Number,
        default:0
    }
},{timestamps:true})

const Wallet = model('Wallet' , walletSchema)

module.exports = Wallet
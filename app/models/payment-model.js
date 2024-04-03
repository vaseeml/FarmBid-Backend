const {Schema,model}=require('mongoose')
const paymentSchema=new Schema({
    walletId:{
        type:Schema.Types.ObjectId,
        ref:'Wallet'
    },
    amount:Number,
    paymentType:String,
    transactionId:{
        type:String,
        default:null
    },
    paymentStatus:{
        type:String,
        enum:['pending','successful','failed'],
        default:'pending'
    }
},{timestamps:true})
const Payment=model('Payment',paymentSchema)
module.exports=Payment
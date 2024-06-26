const{Schema,model}=require('mongoose')
const bidSchema=new Schema({
    productId:{
        type:Schema.Types.ObjectId,
        ref:'Product'
    },
    bidderId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    amount:Number,
    status:{
        type:String,
        enum:['Active','Lost','Finished'],
        default:'Active'
    },
    winner:{
        type:Boolean,
        default:false
    }
},{timestamps:true})
const Bid=model('Bid',bidSchema)
module.exports=Bid
const { Schema , model } = require('mongoose')

const reportSchema = new Schema({
    reporterId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    orderId:{
        type:Schema.Types.ObjectId,
        ref:'Order'
    },
    productImage:[String],
    description:String
} , {timestamps:true})
const Report = model('Report' , reportSchema)
module.exports = Report
const { default: mongoose } = require("mongoose");
const {Schema , model} = mongoose

const userSchema = new Schema({
    username:String,
    email:String,
    phone:String,
    password:String,
    role:String,
    isBlock:{
        type:Boolean,
        default:false
    }
}, {timestamps:true})

const User = model('User' , userSchema)

module.exports = User
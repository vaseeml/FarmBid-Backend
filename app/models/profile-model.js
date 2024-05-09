const {Schema,model}=require('mongoose')
const profileSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name:String,
    image:String,
    address:String,
    phone:String,
    description:String
},{timestamps:true})
const Profile=model('Profile',profileSchema)
module.exports=Profile
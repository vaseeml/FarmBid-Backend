const mongoose = require('mongoose')

const configureDB = async()=>{
    try{
        mongoose.connect('mongodb://127.0.0.1:27017/FarmBidConnect')
        //  mongoose.connect(process.env.DB_LINK)
        console.log('connected to db successfully')
    }catch(err){
        console.log(err)
    }
}

module.exports = configureDB
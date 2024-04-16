const mongoose = require('mongoose')

const configureDB = async()=>{
    try{
        mongoose.connect('mongodb://127.0.0.1:27017/FarmBid-Connect')
        console.log('connected to db successfully')
    }catch(err){
        console.log(err)
    }
}

module.exports = configureDB
const mongoose = require('mongoose')

const configureDB = async()=>{
    try{
        mongoose.connect('mongodb://localhost:27017/FarmBid-Connect')
        console.log('connected to db successfully')
    }catch(err){
        console.log(err)
    }
}

module.exports = configureDB
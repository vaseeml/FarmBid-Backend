const mongoose = require('mongoose')

const configureDB = async()=>{
    try{
        mongoose.connect(process.env.DB_LINK)
        console.log('connected to db successfully')
    }catch(err){
        console.log(err)
    }
}

module.exports = configureDB
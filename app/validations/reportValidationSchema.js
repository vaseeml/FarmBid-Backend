const Order = require("../models/order-model")

const reportValidationSchema = {
    orderId:{
        exists:{
            errorMessage:'order id is required'
        },
        notEmpty:{
            errorMessage:'order id cannot be empty'
        },
        isMongoId:{
            errorMessage:'invalid orderId'
        },
        custom:{
            options:async(value , {req})=>{
                const orderId = req.body.orderId
                const order = await Order.findById(orderId)
                if(!order){
                    throw new Error('order id is incorrect')
                }
                    const createdDate = new Date(order.createdAt)
                    const expiryDate = new Date(createdDate.getTime())
                    expiryDate.setDate(expiryDate.getDate() + 1)
                    const now = new Date()
                    if(now > expiryDate){
                        throw new Error('report should be done after 1 days of purchase/order')
                    } else {
                        return true
                    }
            }
        }
    },
    description:{
        exists:{
            errorMessage:'description is required'
        },
        notEmpty:{
            errorMessage:'description cannot be empty'
        },
        isLength:{
            option:{min:20 , max:50},
            errorMessage:'description should be minimum of 20 characters'
        }
    }
}
const Wallet=require('../models/wallet-model')
const bidValidationSchema={
    productId:{
      notEmpty:{
        errorMessage:'Product Id is required'
      }
    },
    amount:{
        notEmpty:{
            errorMessage:'Amount is required'
        },
        isNumeric:{
            errorMessage:'Amount should be a number'
        },
        custom:{
            options: async (value, { req}) => {
                const id = req.user.id
                const wallet = await Wallet.findById(id)
                if (wallet.balance>=value) {
                  return true
                } else {
                  throw new Error("Insufficient Balance")
                }
              }
        }
    }
}
module.exports=bidValidationSchema
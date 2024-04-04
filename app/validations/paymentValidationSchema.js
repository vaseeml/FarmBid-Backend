const Wallet = require('../models/wallet-model')

const paymentsValidationSchema = {
  walletId:{
        notEmpty: {
          errorMessage: "wallet ID is empty",
        },
        isMongoId: {
          errorMessage: "wallet ID format",
        },
        custom: {
          //checks wheather id found in database
          options: async (value, { req, res }) => {
            const id = req.body.walletId
            
            const findId = await Wallet.findById(id)
            if (findId) {
              return true
            } else {
              throw new Error("wallet not found")
            }
          }
        }
      },
    amount:{
        notEmpty:{
            errorMessage:'Amount cannot be empty'
        },
        isNumeric:{
            options:{min:1},
            errorMessage:'Amount should be a number'
        }
        
    }
}

module.exports = paymentsValidationSchema
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
            options:{min:0,max:9999999},
            errorMessage:'Amount should be a number'
        }
        // custom: {
        //     //checks wheather amount matches to specific wallet
        //     options: async (value, { req, res }) => {
        //       const id = req.body.walletId
        //       const amount = req.body.amount
        //       const findwallet = await Wallet.findById(id)
        //       if (findwallet.amount == amount) {
        //         return true
        //       } else {
        //         throw new Error("Invalid amount")
        //       }
        //     }
        // }   
    }
}

module.exports = paymentsValidationSchema
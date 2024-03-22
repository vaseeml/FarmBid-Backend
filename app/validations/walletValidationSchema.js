
const walletValidationSchema = {
    balance:{
        exists:{
            errorMessage:'Amount is required'
        },
        notEmpty:{
            errorMessage:'Amount should be provided'
        },
        isNumeric:{
            errorMessage:'Entered amount must be number'
        },
        custom:{
            options:async function(value , {req}){
                if(value <= 0){
                    throw new Error('Amount Must Be Greater Than 0')
                }
                return true
            }
        }

    }
}

module.exports = walletValidationSchema
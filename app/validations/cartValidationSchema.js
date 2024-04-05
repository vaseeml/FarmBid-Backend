
const cartValidationSchema = {
    product:{
        exists:{
            errorMessage:'Product is required'
        },
        notEmpty:{
            errorMessage:'Product should not empty'
        },
        isMongoId:{
            errorMessage:'productId should be valid mongoDB Id'
        }
    }
}

module.exports = cartValidationSchema
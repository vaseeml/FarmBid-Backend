
const productCreateSchema = {
    productName:{
        exists:{
            errorMessage:'product name is required'
        },
        notEmpty:{
            errorMessage:'product name cannot be empty'
        }
    },
    // productImg:{
    //     exists:{
    //         errorMessage:'image is required'
    //     },
    //     notEmpty:{
    //         errorMessage:'image should be provided'
    //     },
    //     custom: {
    //         options: async (value, { req }) => {
    //             if (!value) {
    //                 throw new Error('Image is required');
    //             }
    //             // Check if the file is a valid image file
    //             const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    //             const fileMimeType = req.file.mimetype;
    //             if (!imageMimeTypes.includes(fileMimeType)) {
    //                 throw new Error('Invalid image format');
    //             }
    //             return true
    //         }
    //     }
    // },
    // productVideo:{
    //     exists:{
    //         errorMessage:'video is required'
    //     },
    //     notEmpty:{
    //         errorMessage:'video should be provided'
    //     }
    // },
    basePrice:{
        exists:{
            errorMessage:'base price is required'
        },
        notEmpty:{
            errorMessage:'base price cannot be empty'
        },
        isNumeric:{
            errorMessage:'base price should be number'
        }
    },
    stock:{
        exists:{
            errorMessage:'stock is required'
        },
        notEmpty:{
            errorMessage:'stock cannot be empty'
        },
        isNumeric:{
            errorMessage:'stock should be valid number'
        }
    },
    address:{
        exists:{
            errorMessage:'address is required'
        },
        notEmpty:{
            errorMessage:'address cannot be empty'
        }
    }
}

module.exports = productCreateSchema
const User = require('../models/user-model')
const userRegisterSchema = {
    username:{
        exists:{
            errorMessage:'username is required'
        },
        notEmpty:{
            errorMessage:'username cannot be empty'
        },
        trim:true,
        custom:{
            options:async function(value){
                const user = await User.findOne({username:value.toLowerCase()})
                if(user){
                    throw new Error('username already taken')
                }
                return true
            }
        }
    },
    email:{
        exists:{
            errorMessage:'email is required'
        },
        notEmpty:{
            errorMessage:'email cannot be empty'
        },
        isEmail:{
            errorMessage:'email format is invalid'
        },
        normalizeEmail:true,
        trim:true,
        custom:{
            options:async function(value){
                const user = await User.findOne({email:value})
                if(user){
                    throw new Error('email already exists')
                }
                return true
            }
        }
    },
    password:{
        exists:{
            errorMessage:'password is required'
        },
        notEmpty:{
            errorMessage:'password cannot be empty'
        },
        isLength:{
            options:{min:8 , max:128},
            errorMessage:'password must be greater than 8 character and less than 128 characters'
        }
    },
    role:{
        exists:{
            errorMessage:'role is required'
        },
        notEmpty:{
            errorMessage:'role should be selected'
        },
        isIn:{
            options:[['seller' , 'buyer']],
            errorMessage:'role must be selected from given options'
        }
    },
    phone:{
        exists:{
            errorMessage:'phone is required'
        },
        notEmpty:{
            errorMessage:'phone cannot be empty'
        },
        isLength:{
            options:{min:10, max:10},
            errorMessage:'number should be 10 digits'
        },
        isNumeric:{
            errorMessage:'Enter valid numbers'
        },
        custom:{
            options:async function(value){
                const user = await User.findOne({phone:value})
                if(user){
                    throw new Error('phone number already exists')
                }
                return true
            }
        }
    }
}

const userLoginSchema = {
    loginId:{
        exists:{
            errorMessage:'email/phone is required'
        },
        notEmpty:{
            errorMessage:'email/phone cannot be empty'
        }
    },
    password:{
        exists:{
            errorMessage:'password is requird'
        },
        notEmpty:{
            errorMessage:'password cannot be empty'
        }
    }
}
module.exports = {
    userRegisterSchema,
    userLoginSchema
}
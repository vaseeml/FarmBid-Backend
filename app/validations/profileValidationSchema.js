const profileValidationSchema={
    name:{
        exists:{
            errorMessage:'name is required'
        },
        notEmpty:{
            errorMessage:'name cannot be empty'
        }
    },
    address:{
        exists:{
            errorMessage:'address is required'
        },
        notEmpty:{
            errorMessage:'address cannot be empty'
        }
    },
    description:{
        exists:{
            errorMessage:'description is required'
        },
        notEmpty:{
            errorMessage:'description cannot be empty'
        }
    }
}
module.exports=profileValidationSchema
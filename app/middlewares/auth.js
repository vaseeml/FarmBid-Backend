const jwt = require('jsonwebtoken')

const authenticateUser = (req , res , next)=>{
    const token = req.headers['authorization']
    if(!token){
        return res.status(401).json({error:'token is required'})
    }
    try{
        const tokenData = jwt.verify(token , process.env.JWT_SECRETKEY)
        req.user = {
            id:tokenData.id,
            role:tokenData.role
        }
        next()
    }catch(err){
        console.log(err)
        res.status(401).json({error:err.message})
    }

}

const authorizeUser = (permittedRole)=>{
    return (req , res , next)=>{
        const role = req.user.role
        if(permittedRole.includes(role)){
            next()
        }else{
            res.status(403).json({error:'your not authorized to acess this role!'})
        }
    }
}

module.exports = {
    authenticateUser,
    authorizeUser
}
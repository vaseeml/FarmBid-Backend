const {validationResult} = require('express-validator')
const User = require('../models/user-model')
const Wallet = require('../models/wallet-model')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const userCtrl = {}

userCtrl.register = async(req , res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
       return res.status(400).json({errors:errors.array()})
    }
    try{
        const {body} = req
        const user = new User(body)
        const noUser = await User.countDocuments() // checking number of users in db
        const salt =await bcryptjs.genSalt() // generating the salt value
        const encryptedPass = await bcryptjs.hash(user.password, salt) // hashing password
        user.password = encryptedPass
        user.username = body.username.toLowerCase()
        if(noUser == 0){
            user.role = 'admin'
        }
        await user.save()
        res.status(201).json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
userCtrl.login = async(req ,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {body} = req
    console.log(body)
    try{
        const user = await User.findOne({$or:[{email:body.loginId}, {phone:body.loginId}]})
        if(!user){
            return res.status(404).json('Invalid Email/Password')
        }
        const checkPassword = await bcryptjs.compare(body.password, user.password)
        if(!checkPassword){
           return res.status(401).json('Invalid Email/Password')
        }
        // checking the wallet of user 
        const userWallet = await Wallet.findOne({userId:user._id})
        if(!userWallet){
            const wallet = new Wallet({userId:user._id , balance:0})
            await wallet.save()
        }
        const tokenData = {
            id:user._id,
            role:user.role
        }
        // Generating the token for authenticated user
        const token = jwt.sign(tokenData , process.env.JWT_SECRETKEY , {expiresIn:'7d'} )
        const updatedUser = _.pick(user , ['_id' , 'username', 'role' , 'email' , 'phone'])
        res.json({token:token , user:updatedUser})
    }
    catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

userCtrl.account = async(req , res)=>{
    try{
        const user = await User.findOne({_id:req.user.id}).select('-password')
        if(!user){
            res.status(404).json({error:'User Not Found'})
        }
        res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

userCtrl.update = async(req ,res)=>{
    const body = req.body
    if(!body.phone || !body.password){
        return res.status(400).json({error:'Fields Cannot Be Empty'})
    }
    try{
        const user = await User.findOne({phone:body.phone})
        if(!user){
            return res.status(404).json({error:'user not found'})
        }
        const salt =await bcryptjs.genSalt()
        const encryptedPass = await bcryptjs.hash(body.password , salt)
        user.password = encryptedPass
        await user.save()
        res.json({message:'updated password successfully'})
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
module.exports = userCtrl
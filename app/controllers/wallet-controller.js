const { validationResult } = require("express-validator")
const Wallet = require("../models/wallet-model")
const _ = require('lodash')

const walletCtrl = {}

walletCtrl.update = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const body = _.pick(req.body , ['balance'])
    try{
        // finding wallet 
        const wallet = await Wallet.findOne({userId:req.user.id})
        // returning user if not found
        if(!wallet){
            return res.status(404).json({error:'Wallet Not Found'})
        }
        //updating wallet balance with new Add balance
        const newBalance = wallet.balance + Number(body.balance)
        // updating to model
        const updateWallet = await Wallet.findOneAndUpdate({_id:wallet._id}, {balance:newBalance} , {new:true})
        res.json(updateWallet)
    }catch(err){
        console.log(err) 
        res.status(500).json({error:'Internal Server Errors'})
    }
}
walletCtrl.show = async(req, res)=>{
    try{
        // finding wallet to show user
        const wallet = await Wallet.findOne({userId:req.user.id}).populate('userId' , ['username' , 'phone' , 'email' , 'role'])
        res.json(wallet)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

module.exports = walletCtrl
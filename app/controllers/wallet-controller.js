const { validationResult } = require("express-validator")
const Wallet = require("../models/wallet-model")
const _ = require('lodash')

const walletCtrl = {}

walletCtrl.update = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id = req.params.id
    const body = _.pick(req.body , ['balance'])
    try{
        const wallet = await Wallet.findOne({_id:id , userId:req.user.id})
        if(!wallet){
            return res.status(404).json({error:'Wallet Not Found'})
        }
       
        const newBalance = wallet.balance + Number(body.balance)
        const updateWallet = await Wallet.findOneAndUpdate({_id:id}, {balance:newBalance} , {new:true})
        res.json(updateWallet)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
walletCtrl.show = async(req, res)=>{
    const id = req.params.id
    try{
        const wallet = await Wallet.findById(id)
        res.json(wallet)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

module.exports = walletCtrl
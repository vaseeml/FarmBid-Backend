const { validationResult } = require("express-validator")
const Wallet = require("../models/wallet-model")
const _ = require('lodash')

const walletCtrl = {}

walletCtrl.update = async (req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {body} = req
    const id = req.params.id
    const balance = _.pick(body , ['balance'])
    try{
        const wallet = await Wallet.findOneAndUpdate({_id:id , userID:req.user.id}, balance , {new:true})
        if(!wallet){
            return res.status(404).json({error:'Wallet Not Found'})
        }
        res.json(wallet)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

module.exports = walletCtrl
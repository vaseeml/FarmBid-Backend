const { validationResult } = require('express-validator')
const Cart = require('../models/cart-model')
const cartCtrl = {}

cartCtrl.list = async(req ,res)=>{
    try{
        const carts = await Cart.find({user:req.user.id})
        res.json(carts)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
cartCtrl.create = async(req ,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const {body} = req
        const cart = new Cart(body)
        cart.user = req.user.id
        await cart.save()
        res.status(201).json(cart)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

cartCtrl.destroy = async(req ,res)=>{
    const { id } = req.params
    try{
        const cart = await Cart.findByIdAndDelete(id)
        res.json(cart)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

module.exports = cartCtrl
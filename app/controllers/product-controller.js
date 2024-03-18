const {validationResult}=require('express-validator')
const Product = require('../models/product-model')
productCtrl={}
productCtrl.create=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const body=req.body
        const product=new Product(body)
        await product.save()
        res.status(201).json(product)
    }catch(err){
        res.status(400).json('Internal server error')
    }
}
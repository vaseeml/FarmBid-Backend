const {validationResult}=require('express-validator')
const Product = require('../models/product-model')
productCtrl={}
productCtrl.create=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const {body,file}=req
        const product=new Product(body)
        product.productVideo=file.path
        await product.save()
        res.status(201).json(product)
    }catch(err){
        res.status(400).json('Internal server error')
    }
}
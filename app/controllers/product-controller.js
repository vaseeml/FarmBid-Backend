const {validationResult}=require('express-validator')
const Product = require('../models/product-model')
productCtrl={}
productCtrl.create=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const {body,files}=req
        const product=new Product(body)
        product.productImg = files.productImg[0].path
        product.productVideo = files.productVideo[0].path
        await product.save()
        res.status(201).json(product)
    }catch(err){
        console.log(err)
        res.status(400).json('Internal server error')
    }
}
module.exports = productCtrl
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
        product.sellerId = req.user.id
        product.productImg = files.productImg[0].path
        product.productVideo = files.productVideo[0].path
        await product.save()
        res.status(201).json(product)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
productCtrl.list = async(req, res)=>{
    try{
        const product = await Product.find().populate('sellerId' , ['name' , 'phone' , 'email'])
        res.status(200).json(product)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
productCtrl.myVeg = async(req, res)=>{
    try{
        const myVeg = await Product.find({sellerId:req.user.id})
        res.status(200).json(myVeg)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
productCtrl.destroy = async(req, res)=>{
    const id = req.params.id
    try{
        const product = await Product.findOneAndDelete({sellerId:req.user.id , _id:id})
        if(!product){
            return res.status(404).json({error:'Product not found/Unthorized'})
        }
        res.json(product)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
productCtrl.update = async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const id = req.params.id
    const {body , files} = req
    let updateProduct = {...body}                        // spreading the body object to get all the existing fields
    if(!files.productImg || !files.productVideo){
        return res.status(400).json({error:'Video/Img is required'})
    }
    updateProduct.productImg = files.productImg[0].path // assigning the path to product image
    updateProduct.productVideo = files.productVideo[0].path // assiging the path to product video
    try{
        const product = await Product.findOneAndUpdate({sellerId:req.user.id , _id:id} , updateProduct , {new:true}) // updating the model with all the fields
        if(!product){        // returning user if unthorized/wrong id is given
            return res.status(404).json({error:'Product not found/Unthorized'})
        }
        res.json(product)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
module.exports = productCtrl
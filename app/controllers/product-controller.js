const { validationResult } = require('express-validator')
const Product = require('../models/product-model')
const Bid = require('../models/bid-model')
productCtrl = {}
productCtrl.create = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { body, files } = req
        const product = new Product(body)
        product.sellerId = req.user.id
        product.productImg = files.productImg[0].path
        product.productVideo = files.productVideo[0].path
        product.biddingStart = new Date(body.biddingStart)
        await product.save()
        res.status(201).json(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.list = async (req, res) => {
    try {
        const product = await Product.find().populate('sellerId', ['name', 'phone', 'email'])
        res.status(200).json(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.getLive = async (req, res) => {
    try {
        const role = req.query.role
        if (!role) {
            return res.status(400).json({ error: 'Role is required' })
        }
        const currentTime = new Date()
        if (role == 'seller') {
            const products = await Product.find({ sellerId: req.user.id, biddingStart: { $lte: currentTime } }).populate('sellerId', ['name', 'phone', 'email'])
            res.json(products)
        }
        if (role == 'buyer') {
            const products = await Product.find({ biddingStart: { $lte: currentTime } })
            res.json(products)
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.getCompleted = async (req, res) => {
    try {
        const role = req.query.role
        if (!role) {
            return res.status(400).json({ error: 'Role is required' })
        }
        const currentTime = new Date()
        if (role == 'seller') {
            const products = await Product.find({ sellerId: req.user.id, biddingEnd: { $lte: currentTime }, biddingStatus: 'closed' }).populate('sellerId', ['name', 'phone', 'email'])
            res.json(products)
        }
        if (role == 'buyer') {
            const bids = await Bid.find({ bidderId: req.user.id, winner: true })
            const productIds = bids.map((ele) => {
                return ele.productId
            })
            const products = await Product.find({ _id: { $in: productIds } })
            res.json(products)
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.myVeg = async (req, res) => {
    try {
        const myVeg = await Product.find({ sellerId: req.user.id })
        res.status(200).json(myVeg)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.destroy = async (req, res) => {
    const id = req.params.id
    console.log(id)
    try {
        const product = await Product.findOneAndDelete({ sellerId: req.user.id, _id: id })
        if (!product) {
            return res.status(404).json({ error: 'Product not found/Unthorized' })
        }
        res.json(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.update = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const id = req.params.id
    const { body, files } = req
    let updateProduct = { ...body }                        // spreading the body object to get all the existing fields

    if (files.productImg) {
        updateProduct.productImg = files.productImg[0].path // assigning the path to product image
    }
    else if (files.productVideo) {
        updateProduct.productVideo = files.productVideo[0].path // assigning the path to product video
    } else {
        updateProduct.productImg = body.productImg              
        updateProduct.productVideo = body.productVideo
    }
    try {
        const product = await Product.findOneAndUpdate({ sellerId: req.user.id, _id: id }, updateProduct, { new: true }) // updating the model with all the fields
        if (!product) {        // returning user if unthorized/wrong id is given
            return res.status(404).json({ error: 'Product not found/Unthorized' })
        }
        res.json(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.getUpcoming = async (req, res) => {
    const role = req.query.role
    if (!role) {
        return res.status(400).json({ error: 'Role is required' })
    }
    const currentTime = new Date()
    try {
        if (role === 'seller') {
            const products = await Product.find({ sellerId: req.user.id, biddingStart: { $gt: currentTime } }).populate('sellerId', ['name', 'phone', 'email'])
            res.json(products)
        }
        if (role == 'buyer') {
            const products = await Product.find({ biddingStart: { $gt: currentTime } })
            res.json(products)
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
productCtrl.sellerProducts = async (req, res) => {
    const id=req.params.id
    try {
        const product = await Product.find({ sellerId: id })
        res.status(200).json(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}
module.exports = productCtrl
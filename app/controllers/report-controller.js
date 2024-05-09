const { validationResult } = require('express-validator')
const Report = require('../models/report-model')
const Order = require('../models/order-model')
const _ = require('lodash')

const reportCtrl = {}

reportCtrl.create = async(req, res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const { files } = req
    const body = _.pick(req.body , ['productImage', 'orderId' ,'description'])
    try{
        const orderId = await Order.findById(body.orderId)
        if(!orderId){
            return res.status(400).json({error:'The order id given by you is invalid, please paste valid order id'})
        }
        const alreadyReported = await Report.findOne({orderId:body.orderId})
        if(alreadyReported){
            return res.status(409).json({error:'your ticket is already rised , please wait we will shortly get back to you via email'})
        }
        console.log('body' , req.body)
        console.log('file' , req.files)
        const report = new Report(body)
        report.reporterId = req.user.id
        report.productImage = files.productImage.map(ele=>ele.path)
        report.save()
        res.json(report)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}

reportCtrl.list = async(req , res)=>{
    try{
        const reports = await Report.find().populate('reporterId' , ['username' , 'phone']).populate({
            path: 'orderId',
            select: ['product' , 'bidAmount'],
            populate: {
                path: 'product',
                select:['productImage' , 'productVideo' , 'sellerId' , 'basePrice'],
                populate:{
                    path:'sellerId'
                }
                // Assuming 'product' is the field in the 'orderId' document that holds the reference to the Product model
            }
            // Assuming 'product' is the field in the 'orderId' document that references the Product model
        })
        res.json(reports)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
module.exports = reportCtrl
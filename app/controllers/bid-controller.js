const Bid = require('../models/bid-model')
const Wallet = require('../models/wallet-model')
const _ = require('lodash')
const bidCtrl = {}

bidCtrl.newBid = async(io ,req ,res )=>{
    const body = _.pick(req.body , ['amount' , 'productId'])
    if(!body.amount && !body.productId){
        return res.status(400).json({error:'Invalid Data'})
    }
    try{
        const bid = new Bid(body)
        bid.bidderId = req.user.id
        bid.amount = Number(body.amount)
        const newBidderWallet = await Wallet.findOne({userId:req.user.id})
        if(!newBidderWallet){
            return res.status(404).json({error:'Wallet Not Found'})
        }
        if(newBidderWallet.balance < Number(body.amount)){
            return res.status(400).json({error:'Insufficiant Balance To Bid'})
        }
        const updateStatus = await Bid.findOne({productId:body.productId ,status:'Active'})
        if(updateStatus){  
            const wallet = await Wallet.findOne({userId:updateStatus.bidderId})
            if(wallet){
                wallet.balance += updateStatus.amount
                await wallet.save()
            }
            updateStatus.status = 'Lost'
            await updateStatus.save()
        }
        await bid.save()
        io.to(body.productId).emit('newBid',bid)
        res.status(201).json(bid)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
    }
}

module.exports = bidCtrl
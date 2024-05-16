const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { validationResult } = require('express-validator')
const Payment = require('../models/payment-model')
const _ = require('lodash')
const paymentsCtrl = {}

// Ctrl for making payment
paymentsCtrl.pay = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const body = _.pick(req.body, ['walletId', 'amount'])
    try {
        const customer = await stripe.customers.create({
            name: 'Testing',
            address: {
                line1: 'India',
                postal_code: '517501',
                city: 'Tirupati',
                state: 'AP',
                country: 'US'
            }
        })
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Wallet-Top-Up'
                    },
                    unit_amount: body.amount * 100
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/payment-success',
            cancel_url: 'http://localhost:3000/payment-cancel',
            customer: customer.id
        })

        // create a payment
        const payment = new Payment(body)
        payment.walletId = body.walletId
        payment.transactionId = session.id
        payment.amount = Number(body.amount)
        payment.paymentType = 'card'
        await payment.save()
        res.json({ id: session.id, url: session.url, amount: payment.amount })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}

// updating the payment after success in payment
paymentsCtrl.successUpdate = async (req, res) => {
    try {
        const id = req.params.id
        const body = _.pick(req.body , ['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id} , body , {new:true})
        res.json(updatedPayment)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}

//updating the payment after failure in payment
paymentsCtrl.failedUpdate = async (req, res) => {
    try {
        const id = req.params.id
        const body = _.pick(req.body , ['paymentStatus'])
        const updatedPayment = await Payment.findOneAndUpdate({transactionId:id}, body , {new:true})
        res.json(updatedPayment)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Errors' })
    }
}

paymentsCtrl.transactionHistory = async(req , res)=>{
    const id = req.params.id
    try{
        const transactionHistory = await Payment.find({walletId:id})
        res.json(transactionHistory)
    } catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Errors'})
    }
}
module.exports = paymentsCtrl
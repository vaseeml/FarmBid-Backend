const {Schema , model } = require('mongoose')

const productSchema = new Schema({
    sellerId:{
        type:Schema.Types.ObjectId, 
        ref:'User'
    },
    productName:String ,
    productImg:[String],
    productVideo:String,
    basePrice:String,
    stock:String,
    weight:String,
    address:String,
    cities:{
        type:String,
        enum:[
            "Bagalkot",
            "Ballari",
            "Belagavi",
            "Bengaluru Rural",
            "Bengaluru Urban",
            "Bidar",
            "Chamarajanagar",
            "Chikballapur",
            "Chikkamagaluru",
            "Chitradurga",
            "Dakshina Kannada",
            "Davanagere",
            "Dharwad",
            "Gadag",
            "Hassan",
            "Haveri",
            "Gulbarga(kalaburagi)",
            "Kodagu",
            "Kolar",
            "Koppal",
            "Mandya",
            "Mysuru",
            "Raichur",
            "Ramanagara",
            "Shivamogga",
            "Tumakuru",
            "Udupi",
            "Karwar",
            "Bijapur",
            "Yadgir"
        ]
    },
    biddingStart: { type: Date, required: true },
    biddingEnd: Date ,
    biddingStatus: { type: String, enum: ['open', 'closed'], default: 'open' }
},{timestamps:true})

const Product = model('Product' , productSchema)

module.exports = Product
const { validationResult } = require("express-validator")
const Profile = require("../models/profile-model")
const User = require("../models/userModel")
const _ = require('lodash')
const profileCtrl={}
profileCtrl.create=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const {body,file}=req
        const profile=new Profile(body)
        profile.userId=req.user.id
        const user=await User.findOne({_id:req.user.id})
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        profile.phone=user.phone
        profile.image=file.path
        await profile.save()
        res.status(201).json(profile)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }
}
profileCtrl.edit=async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try{
        const id=req.params.id
        const userId=req.user.id
        const profile=await Profile.findOne({_id:id,userId:userId})
        if(!profile){
            return res.status(404).json('profile not found')
        }
        const updated=_.pick(req.body,['image','name','address','description'])
        if(req.file){
            updated.image=req.file.path || profile.image
        }
        if(updated.name?.trim().length==0){
            return res.status(400).json({error:'name is required'})
        }
        if(updated.address?.trim().length==0){
            return res.status(400).json({error:'address is required'})
        }
        if(updated.description?.trim().length==0){
            return res.status(400).json({error:'description is required'})
        }
        Object.assign(profile,updated)
        const profile1=await Profile.findOneAndUpdate({_id:id,userId:userId},profile,{new:true})
        res.json(profile1)

    }catch(err){
        console.log(err)
        res.status(500).json({error:'Internal Server Error'})
        
    }
}
profileCtrl.account=async(req,res)=>{
    try{
        const profile=await Profile.findOne({userId:req.user.id})
        res.json(profile)
    }catch(err){
        res.status(500).json({error:'Internal Server Error'})
    }

}
module.exports=profileCtrl
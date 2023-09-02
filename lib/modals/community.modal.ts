import mongoose from "mongoose";

const communitySchema= new mongoose.Schema({
    id:{type:String,required:true},
    username:{type:String,required:true,unique:true},
    name:{type:String,required:true},
    image:{type:String,required:true},
    bio:{type:String,required:true},
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    threads:[{
        type:mongoose.Schema.ObjectId,
        ref:"Thread"
    }],
    onboarded:{type:Boolean,default:false},
    communities:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Community"
        }
    ],
    members:[{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }],
})

const Community = mongoose.models.Community || mongoose.model("Community",communitySchema)

export default Community
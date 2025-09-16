import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    user : {
        type : mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    captain : {
        type : mongoose.Types.ObjectId,
        ref:"Captain",
        required:true,
    },
    pickup : {type: String, required:true},
    destination : {type: String, required:true},
    fare : {type: Number, required:true},
    status : {
        type: String,
        enum: ["pending","accepted","ongoiing","completed"],
        default:"pending"
    },
    duration: {type: Number},//in secoonds
    distance: {type:Number},//in meters
    paymentId: {type:String},
    orderId: {type:String},
    signature: {type:String},
    otp: {type:String},
},{timestamps:true})

export const Ride = mongoose.model("Ride",rideSchema)
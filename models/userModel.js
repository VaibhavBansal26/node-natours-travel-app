const crypto = require('crypto');
const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A user must have a name'],
        maxlength:[40,'A user can have a name of maxlength 40'],
        minlength:[10,'A user can have a name of minlength 10'],
    },
    email:{
        type:String,
        required:[true,'A user must have a email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'please provide a valid email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:{
            values:["user","guide","lead-guide","admin"],
            message:'Only roles available'
        },
        default:'user'
    },
    password:{
        type:String,
        required:[true,'A user must have a password'],
        maxlength:[40,'A user can have a password of maxlength 40'],
        minlength:[8,'A user can have a password of minlength 8'],
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        maxlength:[40,'A user can have a password of maxlength 40'],
        minlength:[8,'A user can have a password of minlength 8'],
        validate:{
            //this only works on save and create!!!
            validator:function(el){//callback fxn when called when new doc is created
                return el === this.password;
            },
            message:"The passwords are not the same" 
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

//PRE SAVE MIDDLEWEAR
userSchema.pre('save',async function(next){
    //Only run this function if the password wass really modified
    if(!this.isModified('password')) return next();
    //HASh the password with cost 12
    this.password = await bcrypt.hash(this.password,12);
    //delete the password
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
//userSchema.pre('/^find/',function(next){
userSchema.pre('find',function(next){
    //this points to the current query //query middlewear
    this.find({active:{$ne:false}});
    next();
});

//INSTANCE METHOD
userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
        console.log(this.passwordChangedAt,JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    console.log({resetToken},this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10*60*1000;

    return resetToken;//for the user
}

const User = mongoose.model('User',userSchema);
module.exports = User;

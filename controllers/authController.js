const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require ('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');



//TOKEN
const signToken = id => {
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });

}

//send Tokem function
const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);

    //COOKIE
    const cookieOptions = { //cookie
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
    //secure:true,
    httpOnly:true //stop xss attacks
    }
    
   // if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt',token,cookieOptions);
    //Remove password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user:user
        }
    });
    
}

//SIGN UP
//Creating a new user
exports.signup = catchAsync(async(req,res,next) => {
    const newUser = await User.create(req.body); //returns a promise
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome();
    /*const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role:req.body.role
    });*/
    createSendToken(newUser,201,res);
    /*const token = signToken(newUser._id);
    res.status(201).json({
        status:"success",
        token,
        data:{
            user:newUser
        }
    });*/
});

//LOGIN
exports.login = catchAsync(async(req,res,next) => {
    const {email,password} = req.body;

    //1.) Check if email and password exist
    if(!email || !password){
        return next(new AppError('Please provide a email and password',400));
    }
    //2.)Check if user exists and password is correct
    const user = await User.findOne({email:email}).select('+password');
    //const correct = await user.correctPassword(password,user.password);
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or password',401));
    }
    //3.)if everything ok send token to client
    createSendToken(user,200,res);
    /*const token = signToken(user._id);
    res.status(201).json({
        status:"success",
        token
    });*/
});

exports.logout = (req,res) => {
    res.cookie('jwt','loggedout',{
        expires:new Date(Date.now() + 10 * 1000),
        httpOnly:true
    });
    res.status(200).json({status:'success'});
};

//PROTECT MIDDLEWEAR
exports.protect = catchAsync(async(req,res,next) => {
    //1.) Getting token and check if its there
    let token;
    if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    console.log(token);
    if(!token){
        return next(new AppError('You are not logged in! Please login to get access',401));
    }
    //2.) Verification token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    console.log(decoded);
    
    //3.) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token doesnot exist.',401));
    }

    //4.) Check if user changed password after the token was issued
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password!! Please login again',401));
    };
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    //THERE IS LOGGED IN USER
    res.locals.user = currentUser;
    next();
});

//CHECK IF THE USER IS LOGGED IN ONLY FOR RENDERED PAGES NO ERRORS

exports.isLoggedIn = async(req,res,next) => {
    //1.) Getting token and check if its there
    let token;
    if(req.cookies.jwt){ 
        try{
            token=req.cookies.jwt
            //2.) Verification token
            const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
            console.log(decoded);
            
            //3.) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if(!currentUser){
            return next();
            }

            //4.) Check if user changed password after the token was issued
            if(currentUser.changePasswordAfter(decoded.iat)){
                return next();
            };
            //THERE IS LOGGED IN USER
            res.locals.user = currentUser;
            //req.user = currentUser;
            return next();
        }catch(err){
            return next();
        }
    }
    next();
};



//MIDDLEWEAR AUTHORIZATION For deleting users

exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        //roles ia an array
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform the action',403));//forbidden
        }
        next();
    }
}

//RESET FUNCTIONALITY

//1. FORGOT PASSWORD
exports.forgotPassword = catchAsync(async(req,res,next) => {
    //1)Get user base on POSTED email
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError('There is no user with that email address',404));
    }
    //2)Generate the reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});

    //3)Send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    
    //const message = `Forgot your password ? submit a patch request witbh your new password and password confirm to ${resetURL}\nIf you didnt ignore.`;
    try{
        //await sendEmail({
        //    email:user.email,
        //    subject:'Your password reset token vaid for only 10 min',
        //    message
        //});
        await new Email(user,resetURL).sendPasswordReset();
        res.status(200).json({
            status:"success",
            message:'Tokrn sent to email'
        });

    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;//this modeifies the data

        await user.save({validateBeforeSave:false});//this saves it

        return next(new AppError('There was an error sending the email '),500);

    }
    
})
//2. RESET PASSWORD
exports.resetPassword = catchAsync(async(req,res,next) => {
    //1)Get user based on token
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken:hashToken,passwordResetExpires:{$gt:Date.now()}});

    //2)If token has not expired and there is a user , set the new password
    if(!user){
        return next(new AppError('Token is invalid or expires',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //Data modified now saving
    await user.save();

    //3)Update changePasswordAt property for the user

    //4)Log the user ,send the email jwt
    createSendToken(user,201,res);
    /*const token = signToken(user._id);
    res.status(201).json({
        status:"success",
        token
    });*/ 
});

//UPDATING PASSWORD
exports.updatePassword = catchAsync(async(req,res,next) => {
    //1. Get user from the collection
    const user = await User.findById(req.user.id).select('+password');
    //2.Check if the posted password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('Your current password is wrong',401));
    }
    //3.If so update the passowrd
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //User.findByIdAndUpdate will not work as intended

    //4.Log in user, send JWT
    createSendToken(user,200,res);
});




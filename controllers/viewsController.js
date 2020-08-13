const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getOverview = catchAsync(async(req,res,next) =>{
    //1.Get tour data from Collection
    const tours = await Tour.find();
    //2 Build template
    //3 Render that template using tour data from 1
    res.status(200).render('overview',{
        title:'All Tours',
        tours:tours
    });
});

exports.getTour = catchAsync(async(req,res,next) =>{
    //1.Get tour data from Collection
    const tour = await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    });
    if(!tour){
        return next(new AppError('There is not our with that name',404));
    }
    //2 Build template
    //3 Render that template using tour data from 1
    res.status(200).render('tour',{
        title:tour.name,
        tour
    });
});

exports.getLoginForm = (req,res) => {
    res.status(200).render('login',{
        title:'Log In'
    })
}

exports.getAccount = (req,res) => {
    res.status(200).render('account',{
        title:'Your Account'
    });
};


exports.getMyTours = catchAsync(async(req,res,next) => {
    //1.Find Bookings
    const bookings = await Booking.find({user:req.user.id})
    //2.Find tours with returned IDS
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({_id:{$in: tourIDs}});

    res.status(200).render('overview',{
        title:'My Tours',
        tours
    });  

});

exports.updateUserData = catchAsync(async(req,res,next) => {
    console.log('User',req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id,{
        name:req.body.name,
        email:req.body.email
    },{
        new:true,
        runValidators:true
    });
    res.status(200).render('account',{
        title:'Your Account',
        user: updatedUser
    });
});
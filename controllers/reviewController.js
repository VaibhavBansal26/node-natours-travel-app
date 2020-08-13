const Review = require('../models/reviewModel');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//1.Get all Reviews

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req,res,next) => {
    //Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

//2. Create a Review
exports.createReview = factory.createOne(Review);

//3.Delete a Review
exports.deleteReview = factory.deleteOne(Review);

//4.Update Review
exports.updateReview = factory.updateOne(Review);

//5.Get a review
exports.getReview = factory.getOne(Review);


//EXTRAS
/*exports.getAllReviews = catchAsync(async(req,res,next) =>{
   let filter = {}
    if(req.params.tourId) filter = {tour :req.params.tourId}
    const reviews = await Review.find(filter);

    res.status(200).json({
        status:'success',
        results:reviews.length,
        data:{
            reviews
        }
    });
});*/


/*exports.createReview = catchAsync(async(req,res,next) => {
    
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status:'success',
        data:{
            review:newReview
        }
    });
});*/





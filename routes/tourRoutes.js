
const express = require('express');
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authController');
//const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

//Defining middlewear router
const router = express.Router();

router.use('/:tourId/reviews',reviewRouter);
//Routes //Chaining middlewear
router.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
// /tours-distance?distance=233&center=-40,45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/top5-tours').get(tourController.aliasTopTours,tourController.getAllTours);

router.route('/')
.get(tourController.getAllTours)
.post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);

router.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

//NESTED ROUTES
/*router
.route('/:tourId/reviews')
.post(authController.protect,authController.restrictTo('user'),reviewController.createReview);
*/
module.exports = router;


///////////////////////////////////////////
//CHALLENGE 1
// create a check body middlewear
// check if body contain the name and price property
//if not, send back 400(bad request)
//add it to the post handler stack

//Param middlewear
//router.param('id',tourController.checkID);
/*router.param('id',(req,res,next,val) => {
    console.log(`Tour id is:${val}`);
    next();
})*/
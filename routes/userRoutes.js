const express = require('express');

//CONTROL HANDLERS
const userController = require("../controllers/userControllers");
const authController = require("../controllers/authController");
const reviewController = require('../controllers/reviewController');
//const { route } = require('./tourRoutes');



const router = express.Router();

//Route for sign up
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout',authController.logout);

//Route for reset and forgot password
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

router.use(authController.protect);//Protect all routes after this
router.patch('/updateMyPassword',authController.updatePassword);

router.get('/me',userController.getMe,userController.getUser);
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe',userController.deleteMe);
//ROUTES
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);



module.exports = router;
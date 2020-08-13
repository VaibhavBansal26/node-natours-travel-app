const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

//to access token from cookies in request
//cookie parser
//EXpress provides the bunch of methods to the variable app on being called

const app = express();
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

//GLOBAL MIDDLEWARES modifies the incoming request data

//Server static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,'public')));

//Set Security HTTP headers
app.use(helmet());
//Development Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Middleware AP1 LIMITING LIMIT REQUESTS
const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60 * 1000,
    message:'Too many requests from htis IP Try in one hour'
});
app.use('/api',limiter);

//Body parser, READING DATA from the body into req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser());

//Data Sanitization against NOSQL query injection 
app.use(mongoSanitize());

//And against XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));




//Test Middleware
app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);
    next();
} )


//3. ROUTES

//MULTIPLE ROUTING (MOUNTING THE ROUTER)
app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter); //Moutning the router ona new path
app.use('/api/v1/bookings',bookingRouter);

app.all('*',(req,res,next) => {
    /*res.status(404).json({
        status:"fail",
        message:`Cant find ${req.originalUrl} on this server!`
    });*/
   /* const err = new Error(`Cant find ${req.originalUrl} on this server!`);
    err.status ='fail';
    err.statusCode = 404;*/
    next(new AppError(`Cant find ${req.originalUrl} on this server!`,404));
});


//GLOBAL ERROR HANDLING MIDDLEWEAR
app.use(globalErrorHandler);

module.exports = app;

////////////////////////////////////////////////////////////
/*
//HTTP GET METHOD
app.get('/', (req,res) => {
    //res.status(200).send('Hello from the server side');
    res.status(200).json({message:'hello baby',app:'Natours'});//Sending json object to the client side from the server

})

//HTTP POST METHOD
app.post('/',(req,res) => {
    res.send('You can certainly post to this endpoint');
})*/

//---------------------------------------------------------------------------------------------------------
//ROUTE HANDLERS OR CONTROLLERS
//GET REQUEST//
//TOP LEVEL CODE IS ONLY EXECUTED ONCE // JSON parse converts JSON to JS object

//------------------------------TOUR Routes


//---------------------------------------------------------------------------------------
//1.API FOR TOURS (ROUTE HANDLER)
//app.get('/api/v1/tours',getAllTours);

//2.API FOR PARTICULAR ID
//app.get('/api/v1/tours/:id',getTour);

//3.DELETE REQUEST
//app.delete('/api/v1/tours/:id',deleteTour);

//4.PATCH REQUEST
//app.patch('/api/v1/tours/:id',updateTour)

//5.POST  OR CREATE TOUR
//app.post('/api/v1/tours',createTour);
//-----------------------------------------------------------------------------------------
//Defining middlewear router
//------------IN ROUTES FILE ---------

/* //Routes
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/

//CREATING OUR OWN MIDDLEWEAR
/*app.use((req,res,next) => {
    console.log('Hello from the middlewear!!!');
    next();
} );*/

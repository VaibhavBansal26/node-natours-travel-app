
const AppError = require("../utils/appError");

//GLOBAL ERROR HANDLINH MIDDLEWEAR
const handleCastErrorDB  = err => {
    const message = `Invalid ${err.path}:${err.value}.`
    return new AppError(message,404);
} 

const handleDuplicateFieldDB = err => {
    const value = err.keyValue.name;
    const message = `Duplicate field value: ${value} Please use another value`;
    return new AppError(message,400);
}

const handleValidationDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message  = `Invalid Input Data ${errors.join('. ')}`;
    return new AppError(message,400);
}
const handleJWTError = err => new AppError('Invalid token Please login again',401);

const handleJWTExpiredError = err => new AppError('Your toke has expired Please login again',401); 
///////////////////////////////////////////////////////////////////////////////////////////////////
const sendErrorDev = (err,req,res) => {
    //A API
    if(req.originalUrl.startsWith('/api')){
        
        return res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
            error:err,
            stack:err.stack
        });
    }
    //B RENDERED WEBSITE
    return res.status(err.statusCode).render('error',{
        title:'Something went wrong',
        msg:err.message
    });
}

const sendErrorProd = (err,req,res) => {
    //A API
    if(req.originalUrl.startsWith('/api')){
    //Operational error : send message to client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status:err.status,
                message:err.message
            });  
        //Programming or other unknown error
        }
        //1)Log Error
        console.log('ERROR',err);
        //2.)Show generic message
        return res.status(500).json({
            status:'error',
            message:"Something is very wrong"
        });
             
    }
    //B RENDERED WEBSITE
    if(err.isOperational){
        return res.status(err.statusCode).render('error',{
            title:'Something went wrong',
            msg:err.message
        });
    }
        //2.)Show generic message
    return res.status(err.statusCode).render('error',{
        title:'Something went wrong',
        msg:'Please try again later'
    });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports =(err,req,res,next) => {
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res);
    } else if(process.env.NODE_ENV === 'production'){
        console.log(process.env.NODE_ENV);
        let error = {...err};
        error.message = err.message;
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldDB(error);
        if(error.name === 'ValidationError') error = handleValidationDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error);
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorProd(error,req,res);
    }
    
   
}
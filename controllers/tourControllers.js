//const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//const { query } = require('express');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('not An mage Please upload images ',400),false);
    }
}

//const upload = multer({dest:'public/img/users'});
const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

exports.uploadTourImages = upload.fields([
    {name:'imageCover',maxCont:1},
    {name:'images',maxCount:3}
]);
//upload.single('image');
//upload.array('images',5);

exports.resizeTourImages = catchAsync(async(req,res,next) => {
    console.log(req.files);

    if(!req.files.imageCover || !req.files.images) return next();
    //1.Image Cover
    //const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    req.body.imageCover =  `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`);

    //req.body.imageCover = imageCoverFilename;
    //2.Images
    req.body.images = [];

    await Promise.all
    (
        req.files.images.map(async(file,i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
        await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90})
        .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
        
    }));

    next();
})

//ALIAS middleware
exports.aliasTopTours = (req,res,next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

//CATCHING ASYNC ERRORS
/*const catchAsync = fn =>{
    return(req,res,next) =>{
    fn(req,res,next).catch(err => next(err));
    }
}*/

/*
exports.getAllTours = catchAsync(async (req,res,next) => {
    //console.log(req.requestTime);
   
       // console.log(req.query);
        //Shallow copy of req.query object
        //BUILD QUERY
        //  IN APIFEATURES METHOD
        //EXECUTE QUERY
        const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;

        //SEND RESPONSE
        res.status(200).json({
            status:'success',
        // requestedAt:req.requestTime,
            results:tours.length,
            data:{//data property to envelop the tour
                tours:tours
            }
    })
   
})*/
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path:'reviews'});
exports.deleteTour = factory.deleteOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
/*
exports.getTour = catchAsync(async (req,res,next) => {
    //console.log(req.params);
    //const id = req.params.id * 1;
   // const tour = tours.find(el => el.id === id);

    //if(id >tours.length){
     /* if(!tour)  {
        return res.status(404).json({
            status:"fil",
            message:"INVAaLID ID"
        })
    }*/
    //const tour = await Tour.findById(req.params.id).populate('reviews');
    /*.populate({
        path:'guides',
        select:'-__v -passwordChangedAt -passwordResetExpires -passwordResetToken'
    });*///In tourmodel pre middleware
        //Tour.findOne({_id:req.params.id})
    /*if(!tour) {
        return next(new AppError('No tour found with that ID',404));
    }
        res.status(200).json({
            status:'success',
            results:tour.length,
            data:{
               tours:tour
            }
        });
*/
    /*
    try{
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id:req.params.id})
        res.status(200).json({
            status:'success',
            results:tour.length,
            data:{
               tours:tour
            }
        });

    }catch(err){
        res.status(404).json({
            status:"fail",
            message:"INVAaLID ID"
        })
    }*/
  /*  
})
*/

/*
exports.deleteTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour) {
        return next(new AppError('No tour found with that ID',404));
    }
        res.status(204).json({
            status:'success',
            data:null
        })
    /*try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status:'success',
            data:null
        })

    }catch(err){
        res.status(404).json({
            status:"fail",
            message:"Invalid ID"
        })
    }*/
/*    
})*/
/*
exports.createTour = catchAsync(async (req,res,next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status:'success',
        data:{
            tour:newTour
       }
    });
   /* try{
    //const newTour = new Tour({});
    //newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status:'success',
        data:{
            tour:newTour
       }
    });
    }catch(err){
        res.status(400).json({
            status:"fail",
            message:err
        })
    }*/
/*
});*/

/*exports.updateTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators:true
    })
    if(!tour) {
        return next(new AppError('No tour found with that ID',404));
    }
   res.status(200).json({
       status:'success',
       tour:tour
   })
   /* try{
         const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
             new: true,
             runValidators:true
         })
        res.status(200).json({
            status:'success',
            tour:tour
        })

    }catch(err){
        res.status(400).json({
            status:"fail",
            message:'Invalid Data Sent'
        })

    }*/
  /*  
})*/

exports.getTourStats = catchAsync(async (req,res,next) => {
  //  try{
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    _id:{$toUpper:'$difficulty'},
                    numTours: {$sum : 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max:'$price'}
                }
            },
            {
                $sort:{avgPrice : 1}
            },
            /*{
                $match:{_id:{$ne:'EASY'}}
            }*/
        ]);
        res.status(200).json({
            status:'success',
            data:{
                stats
            }
        });

   /* }catch(err){
        res.status(404).json({
            status:"fail",
            message:err
        })
    }*/
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
   // try{
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date( `${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push:'$name'}
                }
            },
            {
                $addFields:{ month : '$_id'}
            },
            {
                $project:{
                    _id: 0
                }
            },
            {
                $sort:{numTourStarts:-1}
            },
            {
                $limit:6
            }
        ]);

        res.status(200).json({
            status:"success",
            data:{
                plan
            }
        });
    /*}catch(err){
        res.status(400).json({
            status:"fail",
            message:err
        })
    }*/
});

exports.getToursWithin = catchAsync(async(req,res,next) => {
    const{distance,latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',');
    const radius = unit === 'mi'?distance/3963.2:distance/6378.1;
    if(!lat || !lng){
        next(new AppError('Please provide lat and long int the format',400));
    }
    console.log(distance,lat,lng,unit);
    const tours = await Tour.find(
        {
            startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
        })
    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    });
});

exports.getDistances = catchAsync(async (req,res,next) => {
    const{latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371:0.001;
    if(!lat || !lng){
        next(new AppError('Please provide lat and long int the format',400));
    }
    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng * 1,lat * 1],
                    //spherical:false
                },
                distanceField:'distance',
                distanceMultiplier:multiplier
                
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ]);
    res.status(200).json({
        status:'success',
        data:{
            data:distances
        }
    });

})


////////////////////////////////////////////
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
/*
exports.checkID = (req,res,next,val) => {
    console.log(`tour id :${val}`);
    /*if(req.params.id * 1 > tours.length)  {
        return res.status(404).json({
            status:"fail",
            message:"INVALID ID"
        })
    }
    next();

} */
/*
exports.checkBody = (req,res,next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status:'fail',
            message:'Missing price or name'
        })
    }
    next();
}
*/
/*
exports.createTour = (req,res) => {
    //console.log(req.body);
    //const newId = tours[tours.length-1].id +1;
    // eslint-disable-next-line prefer-object-spread
    const newTour = Object.assign({id:newId},req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err =>{
        res.status(201).json({
            status:'success',
            data:{
                tour:newTour
            }
        })
    })
//res.send('Done');
}

/*const tours = await Tour.find({
            duration:5,
            difficulty:'easy'
        })*/
        //const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        
//exports.getTour = async (req,res) => {
            //console.log(req.params);
            //const id = req.params.id * 1;
           // const tour = tours.find(el => el.id === id);
        
            //if(id >tours.length){
             /* if(!tour)  {
                return res.status(404).json({
                    status:"fil",
                    message:"INVAaLID ID"
                })
}*/
/**
 exports.getAllTours = async (req,res) => {
    //console.log(req.requestTime);
    try{
        console.log(req.query);
        //Shallow copy of req.query object
        //BUILD QUERY

        //1.)Filtering -----------------------------------
        /*const queryObj = {...req.query}
        const excludedFields = ['page','sort','limit','fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //console.log(req.query,queryObj); --

        //2.)ADVANCE FILTERING ----------------------------
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g,match => `$${match}`);
        console.log(JSON.parse(queryStr));

        //const query = Tour.find(queryObj);
        let query = Tour.find(JSON.parse(queryStr));*/

       //3.)SORTING --------------------------------------
       /*if(req.query.sort){
           const sortBy = req.query.sort.split(',').join(' ');
           //console.log(sortBy);
           query = query.sort(sortBy);
           //query = query.sort(req.query.sort);
       }else{
           query = query.sort('-createdAt');
       }*/

       //4.) FIELD LIMITING ----------------------------
      /* if(req.query.fields){
           const fields = req.query.fields.split(',').join(' ');
           query = query.select(fields);
       }else{
           query = query.select('-__v');
       }*/

       //5.) PAGINATION---------------------------------
       /*const page = req.query.page * 1 || 1;
       const limit = req.query.limit * 1 || 1;
       const skip = (page - 1) * limit;

       query = query.skip(skip).limit(limit);
       if(req.query.page){
           const numTours = await Tour.countDocuments();
           if(skip >= numTours) throw new Error('This page doesnot exist');
       }*/

        //EXECUTE QUERY
        /*const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;

        //SEND RESPONSE
        res.status(200).json({
            status:'success',
        // requestedAt:req.requestTime,
            results:tours.length,
            data:{//data property to envelop the tour
                tours:tours
            }
    })
    }catch(err){
        res.status(404).json({
            status:"fail",
            message:err
        })
    }
}

exports.getAllTours = catchAsync(async (req,res) => {
    //console.log(req.requestTime);
    try{
       // console.log(req.query);
        //Shallow copy of req.query object
        //BUILD QUERY
        //  IN APIFEATURES METHOD
        //EXECUTE QUERY
        const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;

        //SEND RESPONSE
        res.status(200).json({
            status:'success',
        // requestedAt:req.requestTime,
            results:tours.length,
            data:{//data property to envelop the tour
                tours:tours
            }
    })
    }catch(err){
        res.status(404).json({
            status:"fail",
            message:err
        })
    }
})

 */

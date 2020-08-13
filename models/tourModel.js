
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true,
        trim:true,
        maxlength:[40,'A tour musht have 40'],
        minlength:[10,'A tour must have more equal than 10 characters'],
        //validator:[validator.isAlpha,'err message only character']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a group size'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Stick with three difficult options'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1'],
        max:[5,'Rating must be below 5'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            //This only points to the current document
            validator:function(val){
                return val < this.price;
            },
            message:'Discount price ({VALUE}) should be below thregular price'
    }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A summary is required']
    },
    description:{
        type:String,
        trim:true,
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        //  GeoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },//embed documnets
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    //guides:Array//Embedding
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],
    /*reviews:[//child referencing
        {
            type:mongoose.Schema.ObjectId,
            ref:'Review'
        }
    ]*/
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:"2dsphere"});
//tourSchema.createIndex( { startLocation : "2dsphere" } )

//DOCUMENT MIDDLEWEAR: run before .save() and .create()
tourSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
});
//EMBEDDING
//Get the Tour guide data from the middleware //EMBEDDING
/*tourSchema.pre('save',async function(next){
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
});*/

/*
tourSchema.pre('save',function(next){
    console.log("Will save doc...");
    next();
})

tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
})
*/

//QUERY MIDDLEWEAR
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now() - this.start} milliseconds!!`);
    //console.log(docs);
    next();
});

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt -passwordResetExpires -passwordResetToken'
    });
    next();
});

//AGGREGATION MIDDLEWEAR
/*tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({
        $match:{
            secretTour:{$ne:true}
        }
    })
    console.log(this.pipeline());
    next();
})*/


//VIRTUAL
tourSchema.virtual('durationWeek').get(function(){
    return this.duration / 7;
});

//Virtual Populate **Important
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

const Tour = mongoose.model('Tour',tourSchema);
module.exports = Tour;
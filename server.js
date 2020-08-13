const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path:'./config.env'});

const DB = process.env.DATABASE;
mongoose.connect(DB,{
    useNewUrlParser : true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(con =>{
    //console.log(con.connections);
    console.log("Connection established");
})

const app = require('./app');


//console.log(process.env);
//port no
const port =process.env.PORT || 8000;

//App listening on port 3000
const server = app.listen(port,() => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection',err => {
    console.log(err.name,err.message);
    console.log('UNHANDLED REJECTION!! SHUTTING DOWN');
    server.close(() => {
        process.exit(1);
    })
    //
})

process.on('uncaughtException',err => {
    console.log(err.name,err.message);
    console.log('UNHANDLED EXCEPTION!! SHUTTING DOWN');
    server.close(() => {
        process.exit(1);
    })
    //
})




//////////////////////////////////
/*
const testTour = new Tour({
    name:"The parkers campus",
    price:600
    
});

testTour.save().then(doc =>{
    console.log(doc);
}).catch(err => {
    console.log('ERROR:',err);
});
*/

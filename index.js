const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

//use cors
app.use(cors());

//use body parser
app.use(bodyParser.json());

//use routes
app.use('/api',require('./routes/api'));

const PORT = process.env.PORT||8000;
app.listen(PORT, (err)=>{
    if(err){
        console.log(`Error in running server on port ${PORT}`);
    }else{
        console.log(`Server running on port ${PORT}`);
    }
})
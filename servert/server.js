//importing moduels
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./routes/auth');
const user = require('./routes/user');
const tweet = require('./routes/tweet');

//initialize express
const app = express();
//to receive json data
app.use(express.json());
//initialize cors which avails any origin
app.use(cors({
    origin: '*'
}));

//connect mongodb with the help of mongoose

mongoose.connect('mongodb+srv://react:react@react.goy1gcr.mongodb.net/').then(
    console.log("db is connected")
);

//static the image files avilable to frontend
app.use("/images", express.static("images"));
app.use("/tweetimages", express.static("tweetimages"));
//auth api's
app.use('/api/auth', auth);
//user api's
app.use('/api/user', user);
//tweet api's
app.use('/api/tweet', tweet);











app.listen(5000, () => console.log("server is running"));

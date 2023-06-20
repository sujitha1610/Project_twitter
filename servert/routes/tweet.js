const router = require('express').Router();
const { Tweet } = require('../models/File');
const middleware = require('./jwtmiddleware');
const multer = require('multer');
const path = require('path');

//initialize multer
const storageEngine = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, 'tweetimages')
    },
    filename: function (req, file, callback) {
        callback(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});


const upload = multer({
    storage: storageEngine,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
});


//make a tweet
router.post('/', upload.single('tweetphoto'), middleware, async (req, res) => {
    const { content } = req.body;
    const tweetedby = req.user.id;
    if (tweetedby) {
        if (req.file) {
            const tweet = new Tweet({
                content: content,
                tweetedby: tweetedby,
                image: req.file.filename
            });
            await tweet.save();
        }
        else {
            const tweet = new Tweet({
                content: content,
                tweetedby: tweetedby
            });
            await tweet.save();
        }
        return res.status(200).json('tweeted successfully');
    }
    else {
        return res.status(400).json('token is absent');
    }
});

//like a tweet
router.put('/:id/like', middleware, async (req, res) => {
    const currentuser = req.user.id;
    if (currentuser) {
        const tweet = await Tweet.findById(req.params.id);
        if (!tweet.likes.includes(currentuser)) {
            await tweet.updateOne({ $push: { likes: currentuser } });
            return res.status(200).json('liked successfully');
        }
        else {
            return res.status(405).json('you already liked this tweet')
        }
    }
    else {
        return res.status(400).json("token is absent");
    }
});

//unlike tweet
router.put('/:id/dislike', middleware, async (req, res) => {
    const currentuser = req.user.id;
    if (currentuser) {
        const tweet = await Tweet.findById(req.params.id);
        if (tweet.likes.includes(currentuser)) {
            await tweet.updateOne({ $pull: { likes: currentuser } });
            return res.status(200).json('disliked successfully');
        }
        else {
            return res.status(405).json('you were not liked to dislike');
        }
    }
    else {
        return res.status(400).json('token is absent');
    }
});

//reply on a tweet
router.post('/:id/reply', middleware, async (req, res) => {
    const { content } = req.body;
    const replyby = req.user.id;
    if (replyby) {
        const tweet = new Tweet({
            content: content,
            tweetedby: replyby,
            replyedtweet: true,
        });
        await tweet.save();
        await Tweet.findByIdAndUpdate(req.params.id, { $push: { replies: tweet.id } });
        return res.status(200).json('reply sucessfully');
    }
    else {
        return res.status(400).json('token is absent');
    }
});

//get a single tweet
router.get('/:id', middleware, async (req, res) => {
    const currentuser = req.user.id;
    const tweet = await Tweet.findById(req.params.id).populate('tweetedby').populate({
        path: 'replies', populate: { path: 'tweetedby' }
    }).populate('retweetby');
    if (tweet.likes.includes(currentuser)) {
        tweet.islike = true
    }
    if (tweet.tweetedby.id === currentuser) {
        tweet.isdeletebtn = true
    }
    if (tweet.retweetby.includes(currentuser)) {
        tweet.isretweeted = true
    }
    const { password, ...others } = tweet._doc;
    return res.status(200).json({ others });
});

//get all tweets
router.get('/', middleware, async (req, res) => {
    const currentuser = req.user.id;
    const tweets = await Tweet.find({ retweetedtweet: false, replyedtweet: false }).populate('tweetedby').sort({ createdAt: -1 }).limit(20);
    const tweetes = tweets.map((tweet) => {
        // make islike true if the person liked this tweet already
        if (tweet.likes.includes(currentuser)) {
            tweet.islike = true
        }
        //avail delete btn if the person is owner of the tweet
        if (tweet.tweetedby.id === currentuser) {
            tweet.isdeletebtn = true
        }
        //to know the person is retweeted to this tweet
        if (tweet.retweetby.includes(currentuser)) {
            tweet.isretweeted = true
        }
        return tweet;
    });
    return res.status(200).json(tweetes);
});

//get all tweets for profile
router.get('/all/:id/:existusid', async (req, res) => {
    const alltweets = await Tweet.find({ tweetedby: req.params.id }).populate('tweetedby').populate('retweetedfrom');
    const tweetes = alltweets.map((tweet) => {
        // make islike true if the person liked this tweet already
        if (tweet.likes.includes(req.params.existusid)) {
            tweet.islike = true
        }
        //avail delete btn if the person is owner of the tweet
        if (tweet.tweetedby.id === req.params.existusid) {
            tweet.isdeletebtn = true
        }
        return tweet;
    });
    return res.status(200).json(tweetes);
});

//delete a tweet
router.delete('/:id', middleware, async (req, res) => {
    await Tweet.findByIdAndDelete(req.params.id);
    return res.status(200).json('tweet deleted successfully');
});

//retweeted
router.post('/:id/retweet', middleware, async (req, res) => {
    const currentuser = req.user.id;
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet.retweetby.includes(currentuser)) {
        //create a new tweet as retweet
        const retweet = new Tweet({
            content: tweet.content,
            tweetedby: currentuser,
            retweetedfrom: tweet.tweetedby,
            retweetedtweet: true,
            image: tweet.image,
        });
        await retweet.save();
        await tweet.updateOne({ $push: { retweetby: currentuser } });
        return res.status(200).json("retweeted sucessfully");
    }
    else {
        await tweet.updateOne({ $pull: { retweetby: currentuser } });
        return res.status(405).json("you already retweeted this");
    }
});


module.exports = router;
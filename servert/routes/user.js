const router = require('express').Router();
const { User, Tweet } = require('../models/File');
const multer = require('multer');
const path = require('path');
const midddleware = require('./jwtmiddleware');

//get a single user details
router.get('/:id', midddleware ,async (req, res) => {
    const currentuser = req.user.id;
    const user = await User.findById(req.params.id);
    if(currentuser === req.params.id) {
        user.isadmin = true
    }
    const { password, ...others } = user._doc;
    //console.log(user);
    return res.status(200).json(others);
});

//follow user
router.put('/:id/follow', midddleware,async (req, res) => {
    const userid = req.user.id;
    //user cannot follow him self
    if (userid === req.params.id) throw "you can't follow yourself";
    const user = await User.findById(req.params.id);
    const currentuser = await User.findById(userid);
    if (!user.followers.includes(userid)) {
        await user.updateOne({ $push: { followers: userid } });
        await currentuser.updateOne({ $push: { following: req.params.id } });
        return res.status(200).json('you follwed sucessfully');
    }
    else {
        res.status(403).json('you already follow the user');
    }
});

//unfollow user
router.put('/:id/unfollow', midddleware ,async (req, res) => {
    const userid = req.user.id;
    //user cannot unfollow him self
    if (userid === req.params.id) throw "you can't unfollow yourself";
    const user = await User.findById(req.params.id);
    const currentuser = await User.findById(userid);
    if (user.followers.includes(userid)) {
        await user.updateOne({ $pull: { followers: userid } });
        await currentuser.updateOne({ $pull: { following: req.params.id } });
        return res.status(200).json('you unfollwed sucessfully');
    }
    else {
        return res.status(400).json("follow the user first ot unfollow him")
    }
});


//edit user details
router.put('/:id', midddleware,async (req, res) => {
    const currentuser = req.user.id;
    const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
    return res.status(200).json('Account had be updated successfully');
});

//get user tweet
router.post('/:id/tweets', async (req, res) => {
    const tweets = await Tweet.find({ tweetedby: req.params.id });
    return res.status(200).json(tweets);
});

//uploaduser profile picture using multer
const storageEngine = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, 'images')
    },
    filename: function (req, file, callback) {
        callback(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});


const upload1 = multer({
    storage: storageEngine,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
});
router.post('/:id/uploadprofile', upload1.single('profilephoto'), async (req, res) => {
    const profilephoto = req.file.filename;
    await User.findByIdAndUpdate(req.params.id, { $set: { image: profilephoto } });
    return res.status(200).json('profile updated sucessfully');
});


module.exports = router;
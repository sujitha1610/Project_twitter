const mongoose = require("mongoose");
const moment = require("moment");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilepicture: {
        type: String,
    },
    location: {
        type: String,
    },
    isadmin: {
        type: Boolean,
        default: false
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
    location: {
        type: String,
        default: 'enter your location',
    },
    name: {
        type: String,
        default: 'enter your name',
    },
    dob: {
        type: String,
        default: 'enter your dob'
    }
},
    {
        timestamps: true,
    });

const tweetSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        tweetedby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        retweetby: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
        retweetedfrom: {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        },
        image: {
            type: String,
            default: "",
        },
        islike: {
            type: Boolean,
            default: false
        },
        isretweeted: {
            type: Boolean,
            default: false
        },
        retweetedtweet: {
            type: Boolean,
            default: false
        },
        isdeletebtn: {
            type: Boolean,
            default: false
        },
        replyedtweet: {
            type: Boolean,
            default: false
        },
        replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = { User, Tweet };
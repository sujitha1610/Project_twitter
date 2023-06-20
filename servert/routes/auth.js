const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/File');
const jwt = require('jsonwebtoken');

//register route
router.post("/register", async (req, res) => {
    let { name, username, email, password } = req.body;
    //check the user already exist with this username
    const takenUsername = await User.findOne({ username: username });
    if (takenUsername) {
        return res.status(405).json({ message: "username already exists" });
    } else {
        password = await bcrypt.hash(req.body.password, 10);
        const dbUser = new User({
            name,
            username: username.toLowerCase(),
            email,
            password,
        });
        await dbUser.save();
        return res.json({ message: "user account created sucessfully" });
    }
});

//login user
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const userexist = await User.findOne({ username: username });
        if (!userexist) {
            return res.status(404).json('user not found');
        }
        bcrypt.compare(password, userexist.password).then((isCorrect) => {
            if (isCorrect) {
                let payload = {
                    user: {
                        id: userexist.id
                    }
                }
                jwt.sign(payload, 'newsecreate', { expiresIn: 36000000 }, (err, token) => {
                    if (err) throw err;
                    return res.status(200).json({ token: token, email: userexist.email, image: userexist.image, userid: userexist.id });
                });
            }
            else {
                return res.status(405).json('password is incorrect');
            }
        }
        );
    } catch (error) {
        return res.status(500).json("server error")
    }
});

module.exports = router;
'use strict';

const express = require("express");
const router = express.Router();

// Authentication middleware
const { authenticateUser } = require('./middleware/authenticate');


// Import BCRYPT
const bcrypt = require("bcryptjs");

// Get user model
const User = require("./models").User;
const Course = require("./models").Course;
const user = require("./models/user");
const course = require("./models/course");

// Async Handler

// User Routes

// Get authenticated user with 200 HTTP usercode
router.get("/users", authenticateUser, async (req, res) => {
    // This currently gets all users. What we need to do is...
    let user = await User.findByPk(req.currentUser.id, {
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        }
    });
    res.json({user});
    // return the currently authenticated user along with a 200 HTTP status code.
    res.status(200);
});

// Generate a new user
router.post("/users", async (req, res) => {
    try {
        const user = req.body;
        console.log(user.password);         // Not sure I like this, can we run immediately?
        // if (user.password) {
        //     user.password = bcrypt.hashSync(user.password, 10);
        // }
        // console.log(user.password);
        // Create a new user
        await User.create(req.body);
        res.location('/');   // How do I test this?
        res.status(201).json({"Message": "New User Created"});
    } catch (error) {
        console.log("Error: ", error.name);

        // Check for Sequelize Error 
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
});

// Course Routes

// Get course from current user
router.get("/courses", async (req, res) => {
    let courses = await Course.findAll({
        include: [
            {
            model: User, 
            as: "User",
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    res.json(courses);
    // that will return a list of all courses including the User that owns each course and a 200 HTTP status code.
    res.status(200);
});

// Get Route to return corresponding course along with the owner that owns it
router.get("/courses/:id", async (req, res) => {
    let courses = await Course.findByPk(req.params.id, { 
        include: [
            {
            model: User, 
            as: "User",
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    res.json(courses);
    res.status(200);
});

// Post Route to create a new course, set location to newly created course
router.post("/courses", authenticateUser, async (req, res) => {
    const user = req.currentUser;
    if (user) {
        try {
            await Course.create(req.body);
            const courseName = req.body.title;
            res.location('/'); 
            res.status(201).json({"Message": "New Course Created"});
        } catch (error) {
            console.log("Error: ", error.name);

            if (error.name === "SequelizeValidationError") {
                const errors = error.errors.map(err => err.message);
                res.status(400).json({errors});
            } else {
                throw error;
            }
        } 
    } else {
        console.log("Not Authenticated")
    } 
    
});

// Update corresponding course
router.put("/courses/:id", authenticateUser, async (req, res) => {
    let record;
    const user = req.currentUser;
    console.log("THIS IS THE INPUT --- ", user.id)
    if (req.body && user) {
        try {
            // Return a 204 HTTP status code and no content.
            record = await Course.findByPk(req.params.id);
            if (user.id === record.userId) {
                await record.update(req.body, {where: {id: req.params.id}});
                res.status(204).end();
            } else {
                res.status(403).end();
            }
        } catch (error) {
            console.log("Error: ", error.name);

            if (error.name === "SequelizeValidationError") {
                record = await Course.build(req.body);
                const errors = error.errors.map(err => err.message);
                res.status(400).json({errors});
            } else {
                throw error;
            }
        }
    } else {
        res.status(400).end();
    }
    // Might have to return the to the put request to ensure that a blank empty body cannot be pushed
});

// Delete Route
// route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete("/courses/:id", authenticateUser, async (req, res) => {
    const user = req.currentUser;
    if (user) {
        const course = await Course.findOne({where: {id: req.params.id}});
        if (user.id === course.userId) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(403).end();
        }
    }
});


module.exports = router;
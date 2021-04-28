'use strict';

const express = require("express");
const router = express.Router();

// Get user model
const User = require("./models").User;
const Course = require("./models").Course;

// User Routes

// Get authenticated user with 200 HTTP usercode
router.get("/users", async (req, res) => {
    // This currently gets all users. What we need to do is...
    let users = await User.findAll();
    res.json(users);
    // return the currently authenticated user along with a 200 HTTP status code.
    res.status(200);
});

// Generate a new user
router.post("/users", async (req, res) => {
    // Create a new user
    await User.create(req.body);
    res.status(201).json({"Message": "New User Created"});
    // Set location header to "/" - Maybe a redirect
});

// Course Routes

// Get course from current user
router.get("/courses", async (req, res) => {
    let courses = await Course.findAll();
    res.json(courses);
    // that will return a list of all courses including the User that owns each course and a 200 HTTP status code.
    res.status(200);
});

// Get Route to return corresponding course along with the owner that owns it
router.get("/courses/:id", async (req, res) => {
    let courses = await Course.findAll({ 
        where: {
            userId: req.params.id           // req.params.id will have to change once authenticated
        }
    });
    res.json(courses);
    res.status(200);
});

// Post Route to create a new course, set location to newly created course
router.post("/courses", async (req, res) => {
    await Course.create(req.body);
    const courseName = req.body.title;
    res.status(201).json({"Message": "New Course Created"});
    // Redirect res.direct("courses/coursename");
});

// Update corresponding course
router.put("/courses/:id", async (req, res) => {
    // Return a 204 HTTP status code and no content.
    const record = await Course.findByPk(req.params.id);
    await record.update(req.body);
    res.status(204).end();
});

// Delete Route
// route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete("/courses/:id", async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
});





module.exports = router;
'use strict';

const express = require("express");
const router = express.Router();

// Require Authentication middleware
const { authenticateUser } = require('./middleware/authenticate');

// Get user model
const User = require("./models").User;
const Course = require("./models").Course;

/**
 * ASYNC HANDLER
 * Description: This function essentially tries to run each route, and if there is an error, send it to the global error handler.
 * @param {*} callback 
 * @returns 
 */
function asyncHandler(callback) {
    return async(req, res, next) => {
        try {
            await callback(req, res, next);
        } catch (error) {
            res.status(500).send(error);
        }
    }
}

/*********************************************************************
 * USER Routes
 *********************************************************************/

/**
 * GET users route
 * Description: This route does the following...
 *              1. Authenticates the user with the created middleware
 *              2. Finds the specific user using the currentUser found in the middleware
 *              3. Excludes password plus other parts of the response
 * @returns {http status, json} the authenticated User data plus a HTTP status of 200
 */
router.get("/users", authenticateUser, asyncHandler( async (req, res) => {
    let user = await User.findByPk(req.currentUser.id, {
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        }
    });
    res.json({user});
    res.status(200);
}));

/**
 * POST users route
 * Description: This route does the following...
 *              1. Tries to create a user with the information passed in the request body
 *                  a) On success, creates the user, changes the header location and sends an HTTP status of 201
 *              2. If there is an error it checks for either and "SequelizeValidationError" (model validation fails) or "SequelizeUniqueConstraintError" (unique validation fail). If so:
 *                  a) Send a 400 status, with errors
 *                  b) On fail, throws an error picked up by the async handler 
 */

router.post("/users", asyncHandler( async (req, res) => {
    try {
        await User.create(req.body);
        res.location('/');   // How do I test this?
        res.status(201).end();
    } catch (error) {
        // Check for Sequelize Error 
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({errors});
        } else {
            throw error;
        }
    }
}));

/*********************************************************************
 * COURSE Routes
 *********************************************************************/
/**
 * GET 'courses' route 
 * Description: This route will get a list of ALL the courses, including the owner of each course
 * @returns {json, http status} - List of courses and 200 status
 */
router.get("/courses", asyncHandler( async (req, res) => {
    let courses = await Course.findAll({
        include: [
            {
            model: User, 
            as: "User",
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
                }
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    res.json(courses);
    res.status(200);
}));

/**
 * GET 'courses/id' route
 * Description: Retrieves a specific course based on the information sent in the request params. 
 *              Includes the user data for each course.
 * @returns {json, http status} - List of courses as JSON and http status of 200
 */
router.get("/courses/:id", asyncHandler( async (req, res) => {
    let courses = await Course.findByPk(req.params.id, { 
        include: [
            {
            model: User, 
            as: "User",
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
                }
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        }
    });
    res.json(courses);
    res.status(200);
}));

/**
 * POST 'course' route
 * Description: This route does the following
 *              1. Checks for user authentication, if there is a user...
 *              2. Creates a new course using the request body and sends a location change of that id
 * @returns {http status and location} - sends a 201 status, and sets the location the id of the new course
 */
router.post("/courses", authenticateUser, asyncHandler( async (req, res) => {
    const user = req.currentUser;
    if (user) {
        try {
            const course = await Course.create(req.body);
            const courseId = course.id;
            res.location(`/courses/${courseId}`); 
            res.status(201).end();
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
}));

/**
 * PUT 'courses/id' route
 * Description: 1. Checks for user authentication and whether there is information in the request body.
 *              2. Attempts to update a course, but ONLY if the course belongs to the authenticated user.
 *              3. If there is a fail, it checks to see whether the error was a sequelize validation error.
 * @returns {http status} - Number dependent on the outcome. 204 for successful update
 */
router.put("/courses/:id", authenticateUser, asyncHandler( async (req, res) => {
    let record;
    const user = req.currentUser;
    if (req.body && user) {
        try {
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
}));

/**
 * DELETE 'courses/id' route
 * Description: 1. Upon successful user authentication this route will find a course based on the request params. 
 *              2. Then delete the course
 * @return {http status}
 */
router.delete("/courses/:id", authenticateUser, asyncHandler( async (req, res) => {
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
}));


module.exports = router;
'use strict';

const auth = require("basic-auth");
const bcrypt = require('bcryptjs');
const { User } = require('../models');


/**
 * AuthenticateUser middleware
 * 
 * Description: 1. Uses basic-auth to get the credentials of the request
 *              2. If there are credentials - Attempts to match the request with an email in the database
 *              3. If there is a match - Hash the request password and compare the hash against the database - Returning TRUE or FALSE
 *              4. If TRUE - the user is stored on the request object which is used in the route
 *              5. An error message is created if 1-4 fail and passed to the global error
 */
exports.authenticateUser = async (req, res, next) => {
    let message;
    const credentials = auth(req);
    if (credentials) {
        const activeUser = await User.findOne({where: {emailAddress: credentials.name}});
        // Check to see if passwords match
        if (activeUser) {
            const authenticated = bcrypt.compareSync(credentials.pass, activeUser.password);
            // Check to see if authenticated
            if (authenticated) {
                // Store on the request object
                req.currentUser = activeUser;
            } else {
                message = `Authentication failure for ${activeUser.emailAddress}`;
            }
        } else {
            message = `Email address not found for ${credentials.name}`;
        }
    } else {
        message = "Authentication Header not found"
    }

    if (message) {
        res.status(401).json({message: "Access Denied"});
    } else {
        next();
    }
}
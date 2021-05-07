'use strict';

const auth = require("basic-auth");
const bcrypt = require('bcryptjs');
const { User } = require('../models');


// Middleware, exported immediately
exports.authenticateUser = async (req, res, next) => {
    let message;
    const credentials = auth(req);
    console.log("1: ", credentials);
    if (credentials) {
        const activeUser = await User.findOne({where: {emailAddress: credentials.name}});
        console.log("2: ", activeUser);
        // Check to see if passwords match
        if (activeUser) {
            const authenticated = bcrypt.compareSync(credentials.pass, activeUser.password);
            console.log("3. ", authenticated);
            // Check to see if authenticated
            if (authenticated) {
                console.log("4. ", `Authentication Successful for: ${activeUser.emailAddress}`);
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
        console.error(message);
        res.status(401).json({message: "Access Denied"});
    } else {
        next();
    }
}
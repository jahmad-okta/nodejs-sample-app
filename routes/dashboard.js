/*
This code will call Okta and grab all 
the applications a user has access to,
then display the application on a card.
*/
var express = require('express');
var router = express.Router();
var axios = require('axios');
const { application } = require('express');
const { createConfig } = require('../util/util');

router.get("/", async (req, res) => {

    //check if session exist
    if (req.oidc.accessToken === null) {
        console.log("Missing session");
        res.redirect(302, '/login');
    }

    //check if session is active
    else if (req.oidc.accessToken.isExpired()) {
        //res.send("Session Expired. Please Authenticate again");
        res.redirect('/login');
    }

    else {
        //call Okta Application Endpoint for
        var url = process.env.ISSUER_BASE_URL + '/api/v1/users/' + req.oidc.user.sub + '/appLinks';
        var config = createConfig(url, req.oidc.accessToken.access_token, 'get');

        axios(config)
            .then((response) => {
                var applicationsData = response.data;
                if (process.env.NODE_ENV === 'development') {
                    console.log(applicationsData);
                }
                res.render('pages/dashboard', {
                    hasSession: (!req.oidc.accessToken.isExpired()),
                    username: req.oidc.user.name,
                    isAdmin: (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false),
                    applications: applicationsData
                });
            })
            .catch((error) => {
                console.log(error);
                res.send(error);
            });
    }

});

module.exports = router
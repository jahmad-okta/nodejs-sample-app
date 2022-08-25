var express = require('express');
var router = express.Router();
var axios = require('axios');
const { application } = require('express');

var groupID = {
    "1": "00g1v21nxuDkIC96J697",
    "2": "00g1v21yr8A5rSFuI697",
    "3": "00g1v20s036Vclhi6697",
}

//ADMIN
router.get("/", async (req, res) => {
    console.log(req.oidc.accessToken.access_token);
    var config = {
        method: 'get',
        url: process.env.ISSUER_BASE_URL + '/api/v1/users?limit=25',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + req.oidc.accessToken.access_token
        }
    };

    var userdata = [];

    axios(config)
        .then(function (response) {
            users = response.data
            users.forEach(user => {
                if (user.profile.email !== req.oidc.user.email) {
                    userdata.push(user);
                }
            });
            res.render('pages/admin', {
                users: userdata,
                hasSession: (!req.oidc.accessToken.isExpired()),
                username: req.oidc.user.name,
                isAdmin: (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false)
            });
        })
        .catch(function (error) {
            res.send(error.response.statusText);
        });

});

router.get("/create", (req, res) => {
    var endpoint = process.env.ISSUER_BASE_URL + '/api/v1/users/me';

    axios(createConfig2(endpoint, req.oidc.accessToken.access_token, 'get'))
        .then(function (response) {
            var permissions = response.data.profile.nodejs_admin_permission_code;
            console.log(permissions);
            res.render('pages/userinfo', {
                hasSession: (!req.oidc.accessToken.isExpired()),
                isAdmin: (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false),
                username: req.oidc.user.name,
                user: { "profile": {}, "_links": "" },
                permissions: permissions,
                update: false,
                error: null
            });
        })
        .catch(function (error) {
            console.log(error);
            res.send(error);
        })
});

router.post("/create", (req, res) => {
    //console.log(req);
    console.log(req.body);
    if (req.body.action == "create") {
        //do create opp
        var data = JSON.stringify({
            "profile": {
                "firstName": req.body.firstName,
                "lastName": req.body.lastName,
                "email": req.body.email,
                "login": req.body.email,
                "nodejs_user_companycode": req.body.groups
            },
            "groupIds": [
                groupID[req.body.groups]
            ]
        });

        //ISSUER_BASE_URL
        var config = {
            method: 'post',
            url: process.env.ISSUER_BASE_URL + '/api/v1/users?activate=false',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + req.oidc.accessToken.access_token
            },
            data: data
        };

        axios(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                res.redirect("/admin");
            })
            .catch((error) => {
                console.log(error);
                res.render('pages/userinfo', {
                    hasSession: (!req.oidc.accessToken.isExpired()),
                    isAdmin: (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false),
                    username: req.oidc.user.name,
                    user: { "profile": {}, "_links": "" },
                    update: false,
                    error: error
                });
            })
    }

})

router.get("/:id", async (req, res) => {

    var config = {
        method: 'get',
        url: process.env.ISSUER_BASE_URL + '/api/v1/users/' + req.params.id,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + req.oidc.accessToken.access_token
        }
    };

    axios(config)
        .then(function (response) {
            user = response.data
            console.log(user);
            res.render('pages/userinfo', {
                user: user,
                hasSession: (!req.oidc.accessToken.isExpired()),
                username: req.oidc.user.name,
                isAdmin: (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false),
                permissions: user.profile.nodejs_user_companycode,
                update: true,
                error: null
            });
        })
        .catch(function (error) {
            //console.log(error);
            res.send(error.response);
        });
});

router.post("/:id", (req, res) => {
    if (req.body.action == "activate" || req.body.action == "deactivate" || req.body.action == "reset") {
        axios(createConfig(req.body.link, req.oidc.accessToken.access_token))
            .then(function (response) {
                //console.log(response.data);
                res.redirect('/admin/' + req.params.id);
            })
            .catch(function (error) {
                console.log(error);
                res.send(error.message + "<br />" + error.response.data.errorSummary);
            });
    }
    else {
        res.send("Add other methods");
    }
})

function createConfig2(url, token, method) {
    var config = {
        method: method,
        url: url,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    return config
}

function createConfig(url, token) {
    var config = {
        method: 'post',
        url: url,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    return config
}

module.exports = router
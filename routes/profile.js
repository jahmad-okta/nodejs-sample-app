var express = require('express');
var router = express.Router();
var axios = require('axios');

router.get("/", async (req, res) => {
    if(req.oidc.isExpired){
      res.redirect('/login');
    }
  
    const userInfo = await req.oidc.fetchUserInfo();
    res.render("pages/profile", {
      hasSession: (!req.oidc.accessToken.isExpired()),
      isAdmin: (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false),
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      username: userInfo.name
    })
  });

  module.exports = router
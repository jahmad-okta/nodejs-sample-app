var express = require('express');
var router = express.Router();
var axios = require('axios');

router.get("/", async (req, res) => {
    res.send(`${req.oidc.user.isAdmin}`);
    const userInfo = await req.oidc.fetchUserInfo();
    console.log(userInfo);
});

module.exports = router
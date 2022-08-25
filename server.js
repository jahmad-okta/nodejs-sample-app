const express = require("express");
var bodyParser = require('body-parser')
require('dotenv').config();
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth, attemptSilentLogin } = require("express-openid-connect");
const app = express();
var axios = require('axios');

//routes
var user = require('./routes/user');
var profile = require('./routes/profile');
var admin = require('./routes/admin');
var dashboard = require('./routes/dashboard');

var hasSession = false;
var isAdmin;

//app.use(morgan("dev"));
//app.use(helmet());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static(join(__dirname, "public")));

app.use(
  auth({
    authRequired: false,
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email groups okta.users.read okta.users.manage okta.users.read.self'
      //scope: 'openid profile email'
    },
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    clientSecret: process.env.CLIENT_SECRET
  })
);

app.get("/", async(req, res) => {
    hasSession = false;
    isAdmin = false;

    try{
      if(typeof req.oidc.user !== 'undefined'){

        if(process.env.NODE_ENV === 'development')
        {
          console.log(req.oidc.user);
        }

        let accessToken = req.oidc.accessToken
        if(accessToken.isExpired()){
          res.redirect('/login');
        }
        hasSession = req.oidc.isAuthenticated();
        
        isAdmin = (req.oidc.user.groups.includes('nodejs_app_admin') ? true : false)
      }
  
      res.render('pages/index', {
        hasSession: hasSession,
        username: ((typeof req.oidc.user !== 'undefined') ? req.oidc.user.name : ""),
        isAdmin: isAdmin
      });
    }
    catch(e){
      res.send(e);
    }
    
})

//USER, PROFILE, ADMIN Pages
app.use("/user", user);
app.use("/profile", profile);
app.use("/admin", admin);
app.use("/dashboard", dashboard);


process.on("SIGINT", function () {
  process.exit();
});

module.exports = app;
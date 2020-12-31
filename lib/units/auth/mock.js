var http = require('http')
var assert = require('assert');  
var crypto = require('crypto');
var express = require('express')
var Cookies=require('cookies')
var validator = require('express-validator')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
var serveStatic = require('serve-static')
const dbapi = require('../../db/api')
var fs = require('fs')
var csrf = require('csurf')
var Promise = require('bluebird')
var basicAuth = require('basic-auth')
var logger = require('../../util/logger')
var request = require('request')
var requtil = require('../../util/requtil')
var jwtutil = require('../../util/jwtutil')
var pathutil = require('../../util/pathutil')
var urlutil = require('../../util/urlutil')
var lifecycle = require('../../util/lifecycle')
var util = require('util')
var uuid = require('uuid')
var url = require('url');
var usePhoneName = {};
var userToken = '';
  
module.exports = function(options) {
  var log = logger.createLogger('auth-mock')
  var app = express()
  var server = Promise.promisifyAll(http.createServer(app))

  lifecycle.observe(function() {
    log.info('Waiting for client connections to end')
    return server.closeAsync()
      .catch(function() {
        // Okay
      })
  })

  // BasicAuth Middleware
  var basicAuthMiddleware = function(req, res, next) {
    function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
      return res.send(401)
    }

    var user = basicAuth(req)

    if (!user || !user.name || !user.pass) {
      return unauthorized(res)
    }

    if (user.name === options.mock.basicAuth.username &&
        user.pass === options.mock.basicAuth.password) {
      return next()
    }
    else {
      return unauthorized(res)
    }
  }

  app.set('view engine', 'pug')
  app.set('views', pathutil.resource('auth/mock/views'))
  app.set('strict routing', true)
  app.set('case sensitive routing', true)
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')
    next()
  })

  app.use(cookieSession({
    name: options.ssid
  , keys: [options.secret]
  }))
  app.use(bodyParser.json())
  app.use(csrf())
  app.use(validator())
  app.use('/static/bower_components',
    serveStatic(pathutil.resource('bower_components')))
  app.use('/static/auth/mock', serveStatic(pathutil.resource('auth/mock')))

  app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken())
    req.cookies=new Cookies(req,res)
    next()
  })

  if (options.mock.useBasicAuth) {
    app.use(basicAuthMiddleware)
  }

  app.get('/', function(req, res) {
    res.redirect('/auth/mock/')
  })

  app.get('/auth/mock/', function(req, res) {
    res.render('index')
  })
  app.get('/auth/contact', function(req, res) {
    dbapi.getRootGroup().then(function(group) {
      res.status(200)
        .json({
          success: true
        , contact: group.owner
        })
    })
    .catch(function(err) {
      log.error('Unexpected error', err.stack)
      res.status(500)
        .json({
          success: false
        , error: 'ServerError'
        })
      })
  })
  app.get('/auth/api/v1/login', function(req, res) {
    var log = logger.createLogger('auth-api-url')
    log.setLocalIdentifier(req.ip)
    var userNameCode =  jwtutil.test_des({  
        alg: 'des-ede3',    //3des-ecb  
        autoPad: true,  
        key: req.query.token,  
        plaintext: req.query.account,  
        iv: null
    }) 
  var userName = req.query.name
    log.info('传入的username: ' + userName);
    if(userNameCode) {
      var token = jwtutil.encode({ 
        payload: {
            email: userNameCode + '@fulan.com'
          , name: userName
        }
        , secret: options.secret
        , header: {
          exp: Date.now() + 24 * 3600
        }
      })
      log.info('生成的token ' + token)
      console.log(options.appUrl);
      var respStr = urlutil.addParams(options.appUrl, {
        jwt: token
      })
      res.header('Access-Control-Allow-Origin', '*')
      res.redirect(respStr);
      log.warn('返回的登录地址 ' + respStr)
      // res.jsonp({url: respStr});
    }
   else {
     console.log("enter error")
    res.status(400)
      .json({
        success: false
        , error: 'ValidationError'
        , validationErrors: err.errors
      })
      }
  })
  app.post('/auth/api/v1/mock', function(req, res) {
    var log = logger.createLogger('auth-mock');
    log.setLocalIdentifier(req.ip)
    console.log(req.body);
    const userName = req.body.name;
    const passWard = req.body.email;
    usePhoneName = userName;
    var token = jwtutil.encode({
      payload: {
        email: passWard + "@fulan.com"
      , name:  userName
      }
    , secret: options.secret
    , header: {
        exp: Date.now() + 24 * 3600
      }
    });
    console.log(token);
    req.cookies.set('username', JSON.stringify(userName));
     res.status(200)
     .json({
       success: true
     , redirect: urlutil.addParams(options.appUrl, {
         jwt: token
       })
     })
    // if(userName && passWard) {
    //   request.post({url:`http://172.19.104.59:8080/stf/checkStfUser`, form:{"username":userName, "password":passWard}},function(error, response, body){
    //     if(!error) {
    //       console.log(error);
    //       console.log(body);
    //     fs.writeFileSync('userNameFile',userName);
    //       var token = jwtutil.encode({
    //         payload: {
    //           email: passWard + "@fulan.com"
    //         , name:  userName
    //         }
    //       , secret: options.secret
    //       , header: {
    //           exp: Date.now() + 24 * 3600
    //         }
    //       })
    //        res.status(200)
    //        .json({
    //          success: true
    //        , redirect: urlutil.addParams(options.appUrl, {
    //            jwt: token
    //          })
    //        })
    //     } else {
    //       res.status(400)
    //         .json({
    //           success: false
    //           , error: 'ValidationError'
    //           , validationErrors: error
    //         })
    //     }
    //   })
    // } else {
    //   res.status(400)
    //   .json({
    //     success: false
    //     , error: 'ValidationError'
    //     , validationErrors: error
    //   })
    // }
  })


  server.listen(options.port)
  log.info('Listening on port %d', options.port)
}

const https = require("https");
const fs = require("fs");

const express = require("express");
const favicon = require("serve-favicon");
const session = require('express-session');
const app = express();

const url = require("url");
const path = require("path");

const sql = require('./conn');
const dbcheck = require('./dbcheck');

const auth = require('./auth');
const user = require('./fetchData');

const mysqlstore = require('express-mysql-session')(session)


const crypto = require('crypto')

// const bodyparser = require('body-parser');
sql.getConnection(function (err) {
  if (err) {
    throw err;
  }
  console.log('Database Connection Established Successfully');
})

const { database_name, table } = dbcheck(sql);

const server = https.createServer(
  {
    key: fs.readFileSync(__dirname + "/cert/key.pem", "utf-8"),
    cert: fs.readFileSync(__dirname + "/cert/cert.pem", "utf-8"),
  },
  app
);

const apiKey = fs.readFileSync(__dirname+"/apiAuth.key","utf-8");

const sessionConnection = require('./sessionManager');
const { json } = require("body-parser");

var sessionStore = new mysqlstore({
  expiration: 1080000,
  createDatabaseTable: true,
  schema: {
    tableName: 'active_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, sessionConnection);

app.use(favicon(__dirname + "/public/image/ico.png"));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname + '/public')));
app.use(session({
  secret: crypto.randomBytes(256).toString('utf-8'),
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: true,
    maxAge: 600000
  }
}))

const isValidEmail = (req, res, next) => {

  if (req.session.email) {
    next();
  }
  else {
    res.redirect('/login');
  }
}

const isValidAuth = (req, res, next) => {
  if (req.session.isAuth) {
    if (req.session.profile) {
      next();
    }
    else {
      res.redirect('/complete-profile');
    }
  }
  else {
    res.redirect('/login');
  }
}

const isValidProfile = (req, res, next) => {
  if (!req.session.profile && req.session.isAuth) {
    next();
  }
  else {
    res.redirect('/login')
  }
}
// console.log(path.join(__dirname+'/public'));

server.listen(3000, function () {
  console.log("[RUNNING]: Https Server on Port 3000");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
  console.log(req.session.id)
  req.session.isAuth = true;
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + '/login.html');
  const validQuery = /^[A-Za-z0-9]+$/;
  const id = req.query.id;
  // console.log(req.query.id);
  if (id) {
    if (id.match(validQuery) && id.length == 32) {
      console.log('Valid Query Entered')
      req.session.link = id;
    }
  }

  // console.log(req.query);
});

app.get('/verify', isValidEmail, function (req, res) {
  
  let data = fs.readFileSync(__dirname + '/otpverification.html','utf-8');
  
  const email = req.session.email.split('@');
  const hidden = email[0].slice(0,2) + 'xxxxxx' + email[0].slice(-1)+'@'+email[1];
  console.log("Hidden: "+hidden);
  data = data.replace(/{%email_id%}/, hidden);
  
  res.setHeader('200',{'content-type':'text/html'});
  res.send(data);
  res.end();
})

app.post('/resend-otp', isValidEmail, function(req, res){
  const email = req.session.email;
  let data = "1";

  auth.setOTP(sql,email, database_name, table);

  res.setHeader('200', {"content":"text/html"});
  res.send(data);
  res.end();
})

app.post('/api/webpush', (req, res)=>{
  const authToken = req.query.auth;
  console.log(req.session.id);
  // console.log(req.query.id);
  if (authToken) {
    if (authToken == apiKey) {
      console.log('Legitimate Webhook');
      console.log(req.body);
      
      const data = req.body;
      const jsonData = JSON.parse(Object.keys(data)[0]);
      
      const particleID = jsonData.particleID;

      if ((particleID.match(/^[A-Za-z0-9]+$/) && particleID.length == 24)
          && (jsonData.uid.match(/^[A-Za-z0-9]+$/) && jsonData.uid.length == 32)
          && (jsonData.date.match(/^[0-9-]+$/) && jsonData.date.length==10)
          && (jsonData.time.match(/^[0-9:]+$/) && jsonData.time.length==8)
          && (jsonData.location.match(/^[A-Za-z0-9 ,]+$/) && jsonData.location.length<=100)
          && typeof jsonData.tds == 'number'
          && typeof jsonData.ph == 'number'
          && typeof jsonData.sg == 'number'
          && typeof jsonData.ua == 'number'
          && typeof jsonData.na == 'number'
          && typeof jsonData.alb == 'number'){

            console.log('Valid Data in the webhook...Updating the database');
            user.updateRecord(sql, database_name, table.vitals, particleID, jsonData);

            res.setHeader('200', {'content-type':'text/html'});
            res.send('Push Successfull');
            res.end();
      }
      else {
        console.log('Invalid JSON Format....');
        res.setHeader('414', {'content-type':'text/html'});
        res.send('Push Failed');
        res.end();
      }
      

      
    }
  }
})

app.get('/complete-profile', isValidProfile, function (req, res) {
  res.sendFile(__dirname + '/registration.html');
})


app.get('/dashboard', isValidAuth, function (req, res) {
  res.sendFile(__dirname + '/userDashboard.html');
})

app.post('/test', isValidAuth, function (req, res) {
  const email = req.session.email;
  let n = user.getName(sql, database_name, table.credentials, email);
  let data = {
    name: "User",
    vitals: {}
  }
  n.then(content => {
    console.log("Content is " + content);
    data.name = content;

    let f = user.getVitals(sql, database_name, table.vitals, email );

    f.then(content =>{
      // console.log(content);
      data.vitals = content;

      res.setHeader('200', { 'content-type': 'text/html' });
      res.send(data);
      res.end()
    })
    
  });


})


app.get('/logout', function (req, res) {
  req.session.destroy();

  res.redirect('/');
})

app.post('/complete-profile', isValidProfile, function (req, res) {
  const email = req.session.email;
  const name = req.body.fullName;
  const gender = req.body.gender;
  const dob = req.body.dob;

  const validName = /^[A-Za-z ]+$/;
  const validDOB = /^[0-9-]+$/;

  if (name && gender && dob) {
    //exists
    if ((name.match(validName) && dob.match(validDOB) && dob.length == 10) && (gender == 'Male' || gender == 'Female' || gender == 'Rather not Disclose')) {
      // all inputs are valid
      const data = {
        personName: name,
        personGender: gender,
        personDoB: dob
      }
      console.log('valid Inputs and Updating the profile ');
      let isSuccess = auth.profileUpdate(sql, database_name, table, email, data);
      isSuccess.then(data => {
        if (data) {
          console.log('Profile Update Completed..');
          console.log('Rediecting to Your Personal Dashboard');
          req.session.profile = 1;

          res.redirect('/dashboard');
        }
      })
    }
    else {
      console.log('Invalid Inputs for the Profile..');
      console.log('Profile updation failed');
      res.redirect('/complete-profile');
    }
  }
  else {
    console.log('Empty inputs.. Kindly re- enter');
    res.redirect('/complete-profile');
  }
  console.log('BOdy: ' + req.body);
  console.log('name: ' + name);
  console.log('gender: ' + gender);
  console.log('dob' + dob);

})
app.post('/verify', isValidEmail, function (req, res) {
  const email = req.session.email;
  const id = req.session.link;
  const otp = `${req.body.OTP0}${req.body.OTP1}${req.body.OTP2}${req.body.OTP3}${req.body.OTP4}${req.body.OTP5}` ;
  const validEmail = /^[A-Za-z@.0-9]+$/;
  const validOTP = /^[0-9]+$/;
  console.log("Vitals UID: " + id);
  if (email && otp) {
    if (email.match(validEmail) && (otp.match(validOTP) && otp.length == 6 )) {
      console.log('Valid OTP and Email Input Now Proceeding towards the authentication process');
      let isAuth = auth.authorise(sql, database_name, table, email, otp);
      console.log('Hetpallo if you see');
      isAuth.then(data => {
        console.log('We have data: ' + data);
        if (data) {
          req.session.isAuth = data;

          console.log('Authenticated:::');

          if (id) {
            auth.associateData(sql, database_name, table, email, id);
          }
          else {
            console.log('No Data to Link... Moving On');
          }

          let profilePresent = auth.checkProfile(sql, database_name, table, email);

          profilePresent.then(prData => {
            console.log('Profile Data: ' + prData);

            if (prData) {
              req.session.profile = prData;

              console.log('Redirecting to the Dashboard Page');

              res.redirect('/dashboard');
            }
            else {
              console.log('Redirecting to the Registration Page');
              res.redirect('/complete-profile');
            }
          })

        }
        else {
          console.log('Unauthorized Access.... Session Destroyed.. OTP Discarded');
          req.session.destroy();
          res.redirect('/login');
        }
      })


    }
    else {
      console.log('Bad Email or OTP Kindly retry');
      res.redirect('/verify');
    }
  }
  else {
    console.log('Empty Input Parameters..');
    res.redirect('/verify');
  }


})

app.post('/login', function (req, res) {
  console.log(req.body.email + "\t" + req.body.OTP);
  const email = req.body.email;
  // const otp = req.body.OTP;
  // console.log('Session Data: '+req.session.link);
  const validEmail = /^[A-Za-z@.0-9]+$/;
  // const validOTP = /^[0-9]+$/;
  // console.log(onlyLetters);
  if (email) {
    if (email.match(validEmail)) {
      console.log('Valid Email and OTP');
      // return res.status(400).json({ err: "No special characters and no numbers, please!"})
      // sql qyuery validate 
      // redirect
      req.session.email = email;
      auth.setOTP(sql, email, database_name, table);

      return res.redirect('/verify');
    }
    else {
      console.log('Invalid Input Cannnot be parsed');
      res.redirect('/login');
    }
  }
  else {
    console.log('Empty response');
    res.redirect('/login');
  }


});

app.get("*", function (req, res) {
  res.sendFile(__dirname + "/404.html");
});


var name = "Zeeshan Naseem";


// io.sockets.on('connection', function (socket) {
//     io.sockets.emit('updateInfo', {
//         name: name
//     });
// });

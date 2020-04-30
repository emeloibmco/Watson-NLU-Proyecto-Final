var express = require('express');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var cors = require('cors');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
//app.use(morgan());


var title = 'Web Gallery S3 ICOS';

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var Controller = require('./server/controllers/Controller')(title);

app.use('/list', Controller.obtenerfile);


// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Server listen on : http://localhost:" + port);
});


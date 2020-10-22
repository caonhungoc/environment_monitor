var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var port = 3333;

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/myDB', {useNewUrlParser: true, useUnifiedTopology: true});

const envSchema = new mongoose.Schema({
    temp: Number,
    humid: Number,
    soil_humid: Number,
    time: Date
})

const env = mongoose.model("env", envSchema);

var humid = 0, temp = 0, soil_humid = 0;
var pin1, pin2, pin3, pin4;
const PIN_NUM = 4;

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);

server.listen(port, () =>{
    console.log("Server running on port " + port);
});

app.get("/", function (req, res) {
	res.render("./index.ejs");
});

app.get("/stored-data", (req, res) => {
    env.find()
    .exec((err, env_data) =>{
        if(err) throw err;
        console.log(env_data);
        res.jsonp({
            data: env_data
        })
    })
})

app.post("/update", urlencodedParser, function(req, res) { // cap nhat bien toan cuc 
    let params = req.body;
    console.log(params.temp);
    if(params.humid >= 0 && params.temp >=0 && params.soil_humid >= 0) {
        var date = new Date();
        env.create({temp: params.temp, humid: params.humid, soil_humid: params.soil_humid, time: date});

        temp = params.temp;// Update new value if it's ok.
        humid = params.humid;
        soil_humid = params.soil_humid;
        res.jsonp({
            data: {
                receive: "OK"
            }
        });
    }
    else {
        res.jsonp({
            data: {
                receive: "NOT OK"
            }
        });
    }
});

app.post("/pin-status", urlencodedParser, function(req, res) { // cap nhat bien toan cuc 
    let params = req.body;

    if(params.pin1 <= 1 && params.pin2 <= 1 && params.pin3 <= 1 && params.pin4 <= 1) {
        pin1 = params.pin1;// Update new value if it's ok.
        pin2 = params.pin2;
        pin3 = params.pin3;
        pin4 = params.pin4;
        res.jsonp({
            data: {
                receive: "OK"
            }
        });
    }
    else {
        res.jsonp({
            data: {
                receive: "NOT OK"
            }
        });
    }
});

app.post("/update-pin-status", urlencodedParser, function(req, res) { // cap nhat bien toan cuc 
    res.jsonp({
        data: {
            pin1: pin1,
            pin2: pin2,
            pin3: pin3,
            pin4: pin4
        }
    });
}); 

app.post("/control-pin-state", urlencodedParser, function(req, res) { // cap nhat bien toan cuc 
    let params = req.body;
    if(params.pin <= PIN_NUM && params.state <= 1) {
        switch (params.pin) {
            case '1':
                pin1 = params.state;
                break;
            case '2':
                pin2 = params.state;
                break;
            case '3':
                pin3 = params.state;
                break;
            case '4':
                pin4 = params.state;
                break;
        }
        res.jsonp({
            data: {
                receive: "OK"
            }
        });
    }
    else {
        res.jsonp({
            data: {
                receive: "NOT OK"
            }
        });
    }
});

app.post("/getdata", urlencodedParser, function(req, res) {
    res.jsonp({
        data: {
            temp: temp,
            humid: humid,
            soil_humid: soil_humid
        }
    });
});

var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var port = process.env.PORT || 3333;

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/my_db', {useNewUrlParser: true, useUnifiedTopology: true});

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

app.get("/stored-data", (req, res) => { // lay thong tin da duoc luu tru trong db
    env.find()
    .exec((err, env_data) =>{
        if(err) throw err;
        console.log(env_data);
        res.jsonp({
            data: env_data
        })
    })
})

app.post("/update", urlencodedParser, function(req, res) { // luu du lieu tu esp vao db 
    let params = req.body;
    console.log(params.temp); 
    console.log(params.humid);
    console.log(params.soil_humid);
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

app.post("/pin-status", urlencodedParser, function(req, res) { // lay gia tri gpio cua esp de cap nhat giao dien
    let params = req.body;

    if(params.pin1 <= 1 && params.pin2 <= 1 && params.pin3 <= 1 && params.pin4 <= 1) {
        pin1 = params.pin1;// Update new value if it's ok.
        pin2 = params.pin2;
        pin3 = params.pin3;
        pin4 = params.pin4;
        res.status(200).jsonp({
            data: {
                receive: "OK"
            }
        });
    }
    else {
        res.status(200).jsonp({
            data: {
                receive: "NOT OK"
            }
        });
    }
});

app.post("/get-pin-status", urlencodedParser, function(req, res) { // esp yeu cau gia tri gipo tu server de dieu khien gpio
    res.status(200).jsonp({
        data: {
            pin1: pin1,
            pin2: pin2,
            pin3: pin3,
            pin4: pin4
        }
    });
}); 

app.get("/get-pin-status", urlencodedParser, function(req, res) { // esp yeu cau gia tri gipo tu server de dieu khien gpio
    res.status(200).jsonp({
            pin1: pin1,
            pin2: pin2,
            pin3: pin3,
            pin4: pin4
    });
}); 

app.post("/control-pin-state", urlencodedParser, function(req, res) { // giao dien web gui yeu cau thay doi trang thai gpio
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

app.get("/getdata", function(req, res) {
    res.jsonp({
        data: {
            temp: temp,
            humid: humid,
            soil_humid: soil_humid
        }
    });
});

var express = require("express");
var bodyparser = require("body-parser");
var lb = require("./lb.js");
var path = require('path');
var textclient=require("./textclient.js");



var app=express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

lb.init(app,"/lb");
textclient(app,"/textclient",express);

//app.use("/public",express.static("public"));

app.get("/",function(req,res){
	res.sendFile('/index.html', {root: './public'});
});

app.get("/public/frontend.js",function(req,res){
	res.sendFile('/frontend.js', {root: './public'});
});

app.get("/public/jquery-2.1.4.min.js",function(req,res){
	res.sendFile('/jquery-2.1.4.min.js', {root: './public'});
});

app.use(function(req,res){
	res.send("404 Not Found. ):");
});

var server=app.listen(8080,function(){
	console.log("Listening at "+server.address().address+":"+server.address().port+".");
});
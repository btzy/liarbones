var express = require("express");
var bodyparser = require("body-parser");
var lb = require("./lb.js");
var path = require('path');


var app=express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

lb.init(app,"/lb");

//app.use("/public",express.static("public"));

app.get("/",function(req,res){
	res.sendFile('index.html', {root: '../frontend'});
});
app.use(function(req,res){
	res.send("404 Not Found. ):");
});
var server=app.listen(8080,function(){
	console.log("Listening at "+server.address().address+":"+server.address().port+".");
});
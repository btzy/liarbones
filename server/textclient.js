module.exports=function(app,path,express){
    app.use("/textclient",express.static("textclient"));
}
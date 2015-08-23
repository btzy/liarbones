module.exports=function(app,path,express){
    app.use(path,express.static("textclient"));
}
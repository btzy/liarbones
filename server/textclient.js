module.exports=function(app,path,express){
    app.get("/textclient",function(req,res){
        res.redirect("/textclient/textclient.html");
    });
    app.use(path,express.static("textclient"));
}
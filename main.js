//Make DB Dir
var exec = require('child_process').exec;
var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var handlebars = require('handlebars');


var app = express();
dbtemp = {};
exec('mkdir /root/local');
exec('mkdir /root/local/db');
exec('mkdir /root/local/db/craigspade-db');

/*if(!fs.existsSync("/root/local/db/craigspade-db/db1.json")){
    exec('echo "{}" > "/root/local/db/db1.json"');
}*/

var Db = require('tingodb')().Db,
    assert = require('assert');
var db = new Db('/root/local/db/craigspade-db/', {});

collection = db.collection("db1.json");
/*
collection.insert([{hello:'world_safe1'}
  , {hello:'world_safe2'}], {w:1}, function(err, result) {
  assert.equal(null, err);

  collection.findOne({hello:'world_safe2'}, function(err, item) {
    assert.equal(null, err);
    assert.equal('world_safe2', item.hello);
  })
})
*/



function crypt(name) {
    return crypto.createHash('md5').update(name).digest('hex');
}


app.configure(function(){
  app.use('/client',express.static(__dirname + '/client'));
});
app.get('/', function(req, res){
    var source = fs.readFileSync(__dirname+'/templates/index.html', 'utf-8');
    var template = handlebars.compile(source);
    //res.send(template());
    res.send(source);
});
app.get('/json/city', function(req, res){
    var city = req.query.city+"/search/?query="+req.query.q+"&catAbb=ccc";
    var jsdom = require("jsdom");
        jsdom.env(city, ["http://code.jquery.com/jquery.js"],

    function (errors, window) {
        var posts = window.$(".content .pl a");
        var postobj = [];
        posts.each(function(){
            var url = window.$(this).attr('href');
            if(url.indexOf("http") == -1){
                url = req.query.city+url
            }
            postobj.push({'title':window.$(this).text(),'url':url});
        })
        res.send(postobj);
    });
});
app.get('/json/regions', function (req, res) {

    var jsdom = require("jsdom");

    jsdom.env("http://www.craigslist.org/about/sites", ["http://code.jquery.com/jquery.js"],

    function (errors, window) {
        window.$(".body h1").each(function () {
            continent = window.$(this).text();
            dbtemp[continent] = {
                name:continent,
                states: {}
            };
            var cont = dbtemp[continent];

            var region = window.$(this).next();

            region.find("h4").each(function () {
                var state = window.$(this).text();
                cont.states[state] = {cities:{}};
                stateobj = cont.states[state];


                var cities = window.$(this).next();
                cities.find("a").each(function () {
                    stateobj.cities[window.$(this).text()] = {"url":window.$(this).attr('href')}
                });

            });

        })
        res.send(dbtemp);
    });
});
app.get('/json/reply', function(req, res){

    var post = req.query.post;
    var city = post.substring(0,post.indexOf('org')+3);

    var jsdom = require("jsdom");

        jsdom.env(post, ["http://code.jquery.com/jquery.js"],

    function (errors, window) {
        var reply = window.$(".replylink a").attr('href');
        res.send([city+reply, city]);
    });
});
app.get('/json/email', function(req, res){
    var reply = req.query.reply;
    var jsdom = require("jsdom");
if(reply > ""){
        jsdom.env(reply, ["http://code.jquery.com/jquery.js"],

    function (errors, window) {
        var email = window.$(".anonemail").val();
        res.send([email]);
    });
}else{
    res.send([]);
}
})


app.listen(3444);
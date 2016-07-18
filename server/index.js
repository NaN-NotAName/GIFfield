var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var bodyParser = require('body-parser');
var io = require('socket.io')(http);


app.use(express.static(__dirname +'/../client'));
app.use(bodyParser.json());

app.get('/', function(req, res){
 res.sendFile(__dirname +'/../client/index.html');

});

//persist current song
var currentSong = "";


io.on('connection', function(socket){

  console.log("I just connected", currentSong + " is playing");


  socket.on('findArtist', function(cb){
    io.emit('findArtist', cb);
  });

  socket.on('playNpause', function(cb){
    if(cb.status === 'play'){
      console.log('status was play', cb.id);
      currentSong = cb.id;
    }
    io.emit('playNpause', cb);
  });

  socket.on('username', function(name) {
    socket.name = name.username;
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg.username + ": " + msg.msg);
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function (data) {
    socket.broadcast.emit('typing', {
      name: data
    });
  });
  
  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function (data) {
    socket.broadcast.emit('stop typing', {
      name: data
    });
  });

  socket.on('disconnect', function(){
    // console.log('user disconnected');
  });
});

//Initializing http on io makes it so its listening on this port
http.listen(process.env.PORT || 8000, function(){
  console.log('App listening on port 8000');
});


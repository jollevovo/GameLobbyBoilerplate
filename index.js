const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const newG = require('./globby').newIOServer;

console.log(io)

app.use('/static', express.static('public'))

newG({
    //Starting State
},
function(player,move,state){
    //State Change on Move
},
2, // Number Of Players
function(state){
    //State Change on Time
},
io
)



app.get('/', function(req, res){
    return res.status(200).sendFile(__dirname + '/index.html');
  });




http.listen(3000, function(){
  console.log('listening on *:3000');
});
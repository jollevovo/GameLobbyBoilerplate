const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const newG = require('./globby').newIOServer;


app.use('/static', express.static('public'))

newG({
  baseState:{
    //Starting State
    test:5
  },
  moveFunction:function(player,move,state){
    
    //State Change on Move
  },
  minPlayers:2,
  maxPlayers:3, // Number of Players you want in a single game
  timeFunction:function(state){
    state.test +=5;
    //State Change on every frame
  },
  statePresenter:function(state,playerId){
    return state;
  },
  connectFunction:function(state,playerRef){
    console.log('connected  ', playerRef)
  },
  disconnectFunction:function(state,playerRef){
    console.log('disconnected  ', playerRef)
  },
  serverFunction:function(minPlayers,maxPlayers,currentPlayers,state){
    if(currentPlayers.length < 5){
      return {message:"Not Enough Players To Start",required:minPlayers,current:currentPlayers.length}
  }
    return
  }
},

io)





app.get('/', function(req, res){
    return res.status(200).sendFile(__dirname + '/index.html');
  });




http.listen(3005, function(){
  console.log('listening on *:3000');
});
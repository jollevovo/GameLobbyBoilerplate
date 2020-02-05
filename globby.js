const newGame = function(properties){
    let baseState = properties.baseState || {};
    
    const timeFunction = properties.timeFunction || function(player,move,state){};
    const moveFunction = properties.moveFunction || function(state){};
    const maxPlayers = properties.maxPlayers || 2;
    const statePresenter = properties.statePresenter || function(copyState,playerRef){
        return copyState
    }
    

    const lobby = function(){
        this.games = [];
        
  
        this.gamesNum = function(){
            return games.length
        }
  
        this.joinGame = function(playerId){
            let ga = this.games.find((g) => {
                return g.players.find((player) => {
                    return player.id == playerId;
                })
            })
  
            if(!ga){
                ga = this.games.find((g) => {
                    let st =  g.returnState(playerId);
                    
                    return g.players.length < g.maxPlayers && !st.started
                })
                if(ga){
                    ga.join(playerId);
                }
            }
            if(!ga){
                ga = new g();
                this.games.push(ga)
                ga.join(playerId)
            }
            return ga.returnState(playerId);
        }

        
  
        this.move = function(playerId,move){
            let ga = this.games.find((g) => {
                return g.players.find((player) => {
                    return player.id == playerId;
                })
            })
  
            
            if(!ga){
                return
            }
            
            return ga.move(playerId,move);
        }
    }
  
    function g(){
  
            let state = JSON.parse(JSON.stringify(baseState));
            state.players = this.players;
            state.started = false;
            
  
            this.playerId = '';
            
            this.maxPlayers = maxPlayers;
            this.players = [];
  
            this.move = (playerId,move) => {
                let player = state.players.find((pl) => {
                    return pl.id == playerId
                })

                if(state.players.length < maxPlayers && state.started === false){
                    return {message:"Not Enough Players To Start",required:maxPlayers,current:state.players.length}
                }

                state.started = true;

                moveFunction(player, move,state)
                return this.returnState(playerId);
            }

            this.timeFunction = (playerId) => {
                
                if(state.players.length < maxPlayers  && state.started === false){
                    return {message:"Not Enough Players To Start",required:maxPlayers,current:state.players.length}
                }


                state.started = true;
                if(timeFunction != undefined){
                    timeFunction(state,playerId)
                }

                return this.returnState(playerId);
            }
  
            this.returnState = (playerId) => {
                let copyState =  JSON.parse(JSON.stringify(state));
                let player = state.players.find((pl) => {
                    return pl.id == playerId
                })
                if(player){
                     
                    copyState = statePresenter(copyState,player.ref)
                }
                return copyState
            }
  
            this.join = (playerId) => {
                if(this.players.length < this.maxPlayers){
                    this.players.push({id:playerId,ref:'player'+(this.players.length+1)});
  
                    state.players = this.players;
                    return this.returnState(playerId);
                }
                else{
                    return undefined
                }
            }
            this.disconnect = (playerId) => {
                    let pl =this.players.find((pl) => {
                        return pl.id == playerId;
                    })
                    this.players.splice(this.players.indexOf(pl),1);
            }
        }
  
    return lobby
  
  }


module.exports.newGame =  newGame;


module.exports.newIOServer = function newServer(properties,io){
    let g = newGame(properties);
    const frameRate = properties.delay || 100;
    const lobby = new g();
    
    const helperFunctionDelay = function(){
        setTimeout(()=>{
            lobby.games.forEach((game) => {
                if(!game.players.length){
                    lobby.games.splice(lobby.games.indexOf(game),1)
                }
                else{
                    game.players.forEach((player) => {
                        io.to(player.id).emit('returnState',game.timeFunction(player.id))
                    })
                }
            })
            helperFunctionDelay();
        },frameRate)
    }
    helperFunctionDelay();

    io.on('connection', function(socket){
        socket.on('disconnect', () => {
            let game  = lobby.games.find((game) =>{
                let isThisIt = false;

                game.players.forEach((player) => {
                    if(player.id === socket.id){
                        isThisIt = true;
                    }
                })

                return isThisIt;
            })

            game.disconnect(socket.id)
            if(!game.players.length){
                lobby.games.splice(lobby.games.indexOf(game), 1)
            }

        })

        lobby.joinGame(socket.id)
        
        socket.on('move', (data) =>{
          let state = lobby.move(socket.id,data);
          
          if(state.players){
            state.players.forEach((pl) => {
                io.to(pl.id).emit('returnState', state)
             })
          }

        })
      });
}

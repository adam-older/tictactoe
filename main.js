// player factory
const PlayerFactory = (name, symb) => {
    return { name, symb, first: false };
}

// events mediator/(pubsub)
var events = {
    events: {},

    on: function(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    off: function(eventName, fn) {
        if (this.events[eventName]) {
            for (let i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            };
        }
    },
    emit: function(eventName, ...data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function(fn) {
                fn(...data);
            });
        }
    }
};

// display module
const display = (function() {

    var tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile) => {
            tile.addEventListener('click', emitTileClick);
        });
    var startGameButton = document.querySelector('#start');
    // console.log(startGameButton);
    startGameButton.addEventListener('click', emitStartClick);
    var playAgainButton = document.querySelector('#playagain');
    playAgainButton.addEventListener('click', emitPlayAgain);

    function emitTileClick() {
        if (!this.innerText) {
            // console.log(this.id);
            events.emit('tileClick', this.id.charAt(this.id.length-1));
        }
    }

    function emitStartClick() {
        try {
            let players = captureNamesSymbs();
            // console.log(players);
            events.emit('startClick', players); // triggers function calls with param players
        } catch(e) {
            alert(e);
        }      
    };

    function captureNamesSymbs() {
        p1Name = document.querySelector('#p1_name').value;
        p1Symb = document.querySelector('#p1_symb').value[0];
        p2Name = document.querySelector('#p2_name').value;
        p2Symb = document.querySelector('#p2_symb').value[0];
        if (p1Name === "" || p2Name === "") {
            throw new Error("Please enter valid names!");
        } else if (p1Symb[0] === p2Symb[0]) {
            throw new Error("Players must have different symbols!");
        } else {
            return [PlayerFactory(p1Name, p1Symb), PlayerFactory(p2Name, p2Symb)];
        }
    };

    events.on('triggerRender', render);

    function render(board) {
        // console.log(board);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let tileNum = parseTileIndicies(i, j);
                let tile = document.querySelector('#tile_' + tileNum.toString());
                tile.innerText = (board[i][j]) ? board[i][j] : '';
            }
        }
    };

    function parseTileIndicies(row, col) {
        let tileNum = (row * 3) + col + 1;
        return tileNum;
    }

    function renderGameEnds() {

    }

    function alertGameEnd(winnerName) {
        let endinfo = document.querySelector('.endinfo');
        let winMessage = (winnerName === 'tie') ? 'It\'s a tie!' : `${winnerName} wins!`
        endinfo.firstElementChild.innerText = winMessage;
        endinfo.style.display = "block";
    }

    events.on('gameEnds', alertGameEnd);
})();

// game controller module
const gameController = (function() {
    var players;

    // turn control submodule
    const turnChanger = (function() {
        var turn = randNum0or1();
        function changeTurn() {
            turn = (turn === 1) ? 0 : 1;
        }
        return {
            getTurn: function() {
                changeTurn();
                return turn;
            },
        }
    })();
    
    // board array submodule (maybe could be a main module since it is basically model) 
    const board_array = (function() {
        let board = [];
        for (let i = 0; i < 3; i++) {
            board[i] = [];
            for (let j = 0; j < 3; j++) {
                board[i][j] = null;
            }
        }

        function parseTileNumber(tileNum) {
            let row = Math.floor((tileNum - 0.5) / 3);
            let col = (tileNum - 1) % 3;
            return { row, col };
        }
        function emitTriggerRender() {
            events.emit('triggerRender', board);
        }
        function transposeBoard() {
            let board_transpose = [];
            for (let i = 0; i < 3; i++) {
                board_transpose[i] = [];
                for (let j = 0; j < 3; j++) {
                    board_transpose[i][j] = board[j][i];
                }
            }
            return board_transpose;
        }
        
        function diagonalsBoard() {
            let diagonals = [];
            let diag1_temp = [];
            let diag2_temp = [];
            for (let i = 0, j = 2; i < 3; i++, j--) {
                diag1_temp.push(board[i][i]);
                diag2_temp.push(board[i][j]);
            }
            diagonals.push(diag1_temp);
            diagonals.push(diag2_temp);
            return diagonals;
        }

        function checkLine(value, symb) {
            return value === symb;
        }

        return {
            reset: function() {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        board[i][j] = null;
                    }
                }
                emitTriggerRender();
            },
            changeTile: function(tileNum, symb) {
                let indices = parseTileNumber(tileNum);
                // console.log(indices.row, indices.col);
                board[indices.row][indices.col] = symb;
                emitTriggerRender();
                // console.log(board[indices.row][indices.col])
            },
            checkWin: function() {
                let linesArray = [].concat(board, transposeBoard(), diagonalsBoard());
                let win = linesArray.some((line) => {
                    let check_symb = line[0];
                    if (check_symb) {
                        let notComplete = line.some( value => value === null );
                        let check = line.every( value => value === check_symb );
                        return check;
                    }
                })
                return win;
            },
            checkBoardIncomplete: function() {
                let complete = board.some((line) => {
                    let notComplete = line.some( value => value === null );
                        return notComplete;
                });
                return complete;
            },
            getBoard: function() {
                return board;
            },
        };
    })();

    function initGame(playersList) {
        // console.log(playersList);
        players = playersList;
        playersList[randNum0or1()].first = true;
        events.on('tileClick', performTurn);
        // new event emitter here that turns on all event emitters. new event emitter at end of game which turns off all event emitters 
    }
    

    function randNum0or1() {
        return Math.round(Math.random());
    }

    function performTurn(tileNum) {
        let turn = turnChanger.getTurn();
        console.log(players[turn].name + 's turn');
        board_array.changeTile(tileNum, players[turn].symb);
        let win = board_array.checkWin();
        let notComplete = board_array.checkBoardIncomplete();
        if (win) {
            gameEndsWithWinner(players[turn]);
        } else if (!notComplete) {
            gameEndWithTie();
        }
        console.log(win);
        // if (win) console.log('win');
    }

    function gameEndsWithWinner(winner) {
        console.log(winner.name + " wins");
        events.off('tileClick', performTurn);
        events.emit('gameEnds', winner.name);
    }

    function gameEndWithTie() {
        console.log('tie');
        events.off('tileClick', performTurn);
        events.emit('gameEnds', 'tie');
    }

    events.on('startClick', initGame);
    
})();
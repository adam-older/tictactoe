// game controller module
export default function gameController() {
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
                        let check = line.every( value => value === check_symb );
                        return check;
                    }
                })
                return win;
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
        console.log(win);
        // if (win) console.log('win');
    }

    events.on('startClick', initGame);
    events.on('tileClick', performTurn);
};
// display module
export default function display() {

    var tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile) => {
            tile.addEventListener('click', emitTileClick);
        });
    var startGameButton = document.querySelector('#start');
    // console.log(startGameButton);
    startGameButton.addEventListener('click', emitStartClick);

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
};
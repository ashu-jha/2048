class Game2048 {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        // Clear existing board
        this.gameBoard.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                this.gameBoard.appendChild(cell);
            }
        }
        
        // Add two initial tiles
        this.addRandomTile();
        this.addRandomTile();
        this.renderBoard();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    getPositionFromCoords(row, col) {
        return {
            x: col * 100 + 15,
            y: row * 100 + 15
        };
    }

    move(direction) {
        let moved = false;
        let prevBoard = JSON.parse(JSON.stringify(this.board));
        let movements = [];

        const getTargetPosition = (row, col, value, dir) => {
            let newRow = row;
            let newCol = col;
            
            switch(dir) {
                case 'ArrowLeft':
                    for(let j = col - 1; j >= 0; j--) {
                        if(this.board[row][j] === 0) {
                            newCol = j;
                        } else if(this.board[row][j] === value) {
                            newCol = j;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                case 'ArrowRight':
                    for(let j = col + 1; j < 4; j++) {
                        if(this.board[row][j] === 0) {
                            newCol = j;
                        } else if(this.board[row][j] === value) {
                            newCol = j;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                case 'ArrowUp':
                    for(let i = row - 1; i >= 0; i--) {
                        if(this.board[i][col] === 0) {
                            newRow = i;
                        } else if(this.board[i][col] === value) {
                            newRow = i;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
                case 'ArrowDown':
                    for(let i = row + 1; i < 4; i++) {
                        if(this.board[i][col] === 0) {
                            newRow = i;
                        } else if(this.board[i][col] === value) {
                            newRow = i;
                            break;
                        } else {
                            break;
                        }
                    }
                    break;
            }
            return { newRow, newCol };
        };

        // Process movements based on direction
        const processMoves = () => {
            let merged = Array(4).fill().map(() => Array(4).fill(false));
            
            const processLine = (row, col) => {
                if (this.board[row][col] !== 0) {
                    const value = this.board[row][col];
                    const { newRow, newCol } = getTargetPosition(row, col, value, direction);
                    
                    if (newRow !== row || newCol !== col) {
                        moved = true;
                        
                        if (this.board[newRow][newCol] === value && !merged[newRow][newCol]) {
                            // Merge tiles
                            movements.push({
                                from: { row, col },
                                to: { row: newRow, col: newCol },
                                value: value,
                                merge: true
                            });
                            this.board[newRow][newCol] = value * 2;
                            this.board[row][col] = 0;
                            this.score += value * 2;
                            merged[newRow][newCol] = true;
                        } else if (this.board[newRow][newCol] === 0) {
                            // Move tile
                            movements.push({
                                from: { row, col },
                                to: { row: newRow, col: newCol },
                                value: value,
                                merge: false
                            });
                            this.board[newRow][newCol] = value;
                            this.board[row][col] = 0;
                        }
                    }
                }
            };

            switch(direction) {
                case 'ArrowLeft':
                    for(let i = 0; i < 4; i++) {
                        for(let j = 1; j < 4; j++) {
                            processLine(i, j);
                        }
                    }
                    break;
                case 'ArrowRight':
                    for(let i = 0; i < 4; i++) {
                        for(let j = 2; j >= 0; j--) {
                            processLine(i, j);
                        }
                    }
                    break;
                case 'ArrowUp':
                    for(let j = 0; j < 4; j++) {
                        for(let i = 1; i < 4; i++) {
                            processLine(i, j);
                        }
                    }
                    break;
                case 'ArrowDown':
                    for(let j = 0; j < 4; j++) {
                        for(let i = 2; i >= 0; i--) {
                            processLine(i, j);
                        }
                    }
                    break;
            }
        };

        processMoves();

        if (moved) {
            this.animateMovements(movements).then(() => {
                this.addRandomTile();
                this.renderBoard();
                this.checkGameStatus();
            });
        }
    }

    animateMovements(movements) {
        return new Promise(resolve => {
            if (movements.length === 0) {
                resolve();
                return;
            }

            const animationPromises = movements.map(movement => {
                const tile = this.gameBoard.querySelector(
                    `[data-row="${movement.from.row}"][data-col="${movement.from.col}"]`
                );
                
                if (tile) {
                    const fromPos = this.getPositionFromCoords(movement.from.row, movement.from.col);
                    const toPos = this.getPositionFromCoords(movement.to.row, movement.to.col);
                    
                    // Update tile's data attributes
                    tile.dataset.row = movement.to.row;
                    tile.dataset.col = movement.to.col;

                    // Animate the tile
                    tile.style.transform = `translate(${toPos.x}px, ${toPos.y}px)`;
                    
                    if (movement.merge) {
                        const newValue = movement.value * 2;
                        tile.dataset.value = newValue;
                        tile.textContent = newValue;
                        tile.className = `tile tile-${newValue}`;
                        return new Promise(resolve => {
                            setTimeout(() => {
                                tile.classList.add('merged');
                                resolve();
                            }, 150);
                        });
                    }
                }
                return Promise.resolve();
            });

            Promise.all(animationPromises).then(() => {
                setTimeout(resolve, 50);
            });
        });
    }

    renderBoard() {
        // Remove tiles that are no longer in the game
        const tiles = this.gameBoard.querySelectorAll('.tile');
        tiles.forEach(tile => {
            const row = parseInt(tile.dataset.row);
            const col = parseInt(tile.dataset.col);
            if (!this.board[row] || !this.board[row][col] || this.board[row][col] !== parseInt(tile.dataset.value)) {
                tile.remove();
            }
        });

        // Update or create tiles
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.board[i][j];
                if (value !== 0) {
                    let tile = this.gameBoard.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (!tile) {
                        tile = document.createElement('div');
                        tile.dataset.row = i;
                        tile.dataset.col = j;
                        tile.dataset.value = value;
                        tile.textContent = value;
                        tile.classList.add('tile', `tile-${value}`);
                        const position = this.getPositionFromCoords(i, j);
                        tile.style.transform = `translate(${position.x}px, ${position.y}px)`;
                        this.gameBoard.appendChild(tile);
                    } else {
                        // Update existing tile if value changed
                        if (parseInt(tile.dataset.value) !== value) {
                            tile.dataset.value = value;
                            tile.textContent = value;
                            tile.className = `tile tile-${value}`;
                        }
                    }
                }
            }
        }
        this.scoreDisplay.textContent = this.score;
    }

    checkGameStatus() {
        // Check for 2048
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 2048) {
                    alert('Congratulations! You reached 2048!');
                    return;
                }
            }
        }

        // Check if moves are possible
        const hasEmptyCell = this.board.some(row => row.includes(0));
        const hasMergableCells = this.board.some((row, i) => 
            row.some((val, j) => 
                (i > 0 && val === this.board[i-1][j]) || 
                (i < 3 && val === this.board[i+1][j]) ||
                (j > 0 && val === row[j-1]) ||
                (j < 3 && val === row[j+1])
            )
        );

        if (!hasEmptyCell && !hasMergableCells) {
            alert('Game Over! No more moves possible.');
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.move(e.key);
            }
        });

        // Cheat button functionality
        const cheatButton = document.getElementById('cheat-button');
        cheatButton.addEventListener('click', () => {
            const selectedTile = this.gameBoard.querySelector('.tile');
            if (selectedTile) {
                const currentValue = parseInt(selectedTile.dataset.value);
                const newValue = prompt('Enter new value for the tile (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048):', currentValue);
                
                if (newValue && !isNaN(newValue)) {
                    const validValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
                    const numberValue = parseInt(newValue);
                    
                    if (validValues.includes(numberValue)) {
                        const row = parseInt(selectedTile.dataset.row);
                        const col = parseInt(selectedTile.dataset.col);
                        
                        // Update score based on value difference
                        if (numberValue > currentValue) {
                            // Add the difference to the score
                            this.score += (numberValue - currentValue);
                        }
                        
                        this.board[row][col] = numberValue;
                        selectedTile.dataset.value = numberValue;
                        selectedTile.textContent = numberValue;
                        selectedTile.className = `tile tile-${numberValue}`;
                        this.scoreDisplay.textContent = this.score;
                    } else {
                        alert('Please enter a valid tile value!');
                    }
                }
            } else {
                alert('No tile selected! Make sure there is at least one tile on the board.');
            }
        });

        // Optional: Touch/Swipe support
        let touchStartX = 0;
        let touchStartY = 0;

        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                this.move(diffX > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else {
                // Vertical swipe
                this.move(diffY > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});

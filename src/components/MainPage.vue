<template>
    <div v-if="isGameOver">
      <h2>{{ winner }} wins!</h2>
    </div>
    <h1>Gomoku Game</h1>
    <ion-button :disabled='gameStarted' :color='primary' @click="selectPiece('black')">Black</ion-button>
    <ion-button :disabled='gameStarted' :color='primary' @click="selectPiece('white')">White</ion-button>
    <ion-button :color="gameStarted ? 'danger' : 'primary'" @click="startGame">{{ gameStarted ? 'Restart' : 'Start Game' }}</ion-button>
    <ion-button :disabled='gameStarted || !selectedPieceColor' :color='primary' @click="startGameAgainstComputer">PLay Against AI</ion-button>
    <div v-if="isWaitingForMove" class="computer-thinking">
      AI is thinking
    </div>
    <div class="outer">
      <div class="board">
        <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
          <div v-for="(cell, colIndex) in row" :key="colIndex" class="cell" @click="!isWaitingForMove && placePiece(rowIndex, colIndex)">
            <img v-if="cell === 'black'" :src="blackpiece" alt="Black Piece" 
            :class="{'winning-piece': isWinningPiece(rowIndex, colIndex) || isLastAIMove(rowIndex, colIndex)}">
            <img v-else-if="cell === 'white'" :src="whitepiece" alt="White Piece" 
            :class="{'winning-piece': isWinningPiece(rowIndex, colIndex) || isLastAIMove(rowIndex, colIndex)}">
          </div>
        </div>
      </div>
    </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      blackpiece: require('@/assets/image/black.png'),
      whitepiece: require('@/assets/image/white.png'),
      board: Array(15).fill().map(() => Array(15).fill(null)),
      selectedFirstPlayer: 'black',
      gameStarted: false,
      isGameOver: false,  
      winner: null,
      playingAgainstComputer: false,
      computerPlayer: null,
      selectedPieceColor: null,
      winningPieces:[],
      isWaitingForMove: false,
      lastAIMove: null
    };
  },
  methods: {
    async computerMove() {
      this.isWaitingForMove = true
      try {
        const response = await this.$http.post('/api/make_move', {
          board: this.board,
          currentPlayer: this.currentPlayer
        });
        const data = response.data;
        console.log('Response from server:', data);
        if (data.row !== undefined && data.col !== undefined) {
          this.lastAIMove = {row: data.row, col: data.col};
          this.placePiece(data.row, data.col);
        } else if (data.error) {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error making AI move:', error);
      } finally {
        this.isWaitingForMove = false
      }
    },
    selectPiece(pieceColor) {
      this.selectedPieceColor = pieceColor;
    },
    startGameAgainstComputer() {
      if (!this.selectedPieceColor) {
        alert("Please select a piece color first, balck moves firsta!");
        return;
      }
      this.playingAgainstComputer = true;
      this.gameStarted = true;
      this.computerPlayer = this.selectedPieceColor === 'black' ? 'white' : 'black';
      
      if (this.selectedPieceColor === 'black') {
        this.currentPlayer = 'black';
      } else {
        this.currentPlayer = 'black'; 
        this.computerMove(); 
      }
    },
    startGame() {
      if (this.gameStarted) {
        this.restartGame();
        return;
      }
      if (!this.selectedPieceColor) {
        alert("Please select a color, black means first!");
        return; 
      }
      this.gameStarted = true;
      this.isGameOver = false;
      this.winner = null;
      this.board = Array(15).fill().map(() => Array(15).fill(null));
      this.currentPlayer = this.selectedPieceColor; 
      this.winningPieces = [];
      this.isWaitingForMove = false;
      this.lastAIMove = null;
      if (this.playingAgainstComputer) {
        if (this.selectedPieceColor === 'white') {
        this.currentPlayer = 'black'; 
        this.computerMove(); 
        }
      }
    },
    checkForWin(row, col, player) {
      const directions = [
        { dr: 1, dc: 0 },  
        { dr: 0, dc: 1 },  
        { dr: 1, dc: 1 },  
        { dr: 1, dc: -1 } 
      ];
      for (let { dr, dc } of directions) {
        if (this.checkDirection(row, col, player, dr, dc) + this.checkDirection(row, col, player, -dr, -dc) + 1 >= 5) {
          this.isGameOver = true;
          this.winner = player;
          this.winningPieces = this.getWinningPieces(row, col, player, dr, dc);
          break;
        }
      }
    },
    getWinningPieces(row, col, player, dr, dc) {
      let pieces = [];
      for (let i = -4; i <= 4; i++) {
        const r = row + i * dr;
        const c = col + i * dc;
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === player) {
          pieces.push({ row: r, col: c });
          if (pieces.length === 5) {
            break; 
          }
        } else {
          pieces = []; 
        }
      }
      return pieces;
    },
    isWinningPiece(row, col) {
      return this.winningPieces.some(piece => piece.row === row && piece.col === col);
    },
    checkDirection(row, col, player, dRow, dCol) {
      let count = 0;
      let r = row + dRow;
      let c = col + dCol;
      while (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === player) {
        count++;
        r += dRow;
        c += dCol;
      }
      return count;
    },
    placePiece(row, col) {
      if (!this.gameStarted || this.board[row][col] || this.isGameOver) return;
      this.board[row][col] = this.currentPlayer;
      this.checkForWin(row, col, this.currentPlayer);
      if (!this.isGameOver) {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
      }
      if (!this.isGameOver && this.playingAgainstComputer && this.currentPlayer === this.computerPlayer) {
        setTimeout(() => this.computerMove(), 500); 
      }
    },
    restartGame() {
      this.board = Array(15).fill().map(() => Array(15).fill(null));
      this.gameStarted = false;
      this.isGameOver = false;
      this.winner = null;
      this.playingAgainstComputer = false;
      this.computerPlayer = null;
      this.selectedPieceColor = null;
      this.winningPieces = [];
      this.isWaitingForMove = false;
      this.lastAIMove = null;
    },
    isLastAIMove(row, col) {
      return this.lastAIMove && this.lastAIMove.row === row && this.lastAIMove.col === col;
    },
  }
};
</script>

<style>
h1 {
  color: blue;
  margin-top: 30px;
  margin-bottom: 30px;
}
h2 {
  color:red;
}
ion-button{
  margin-bottom: 30px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.winning-piece {
  animation: blink 1s linear infinite;
}

@keyframes loading {
  0% { background-color: #fff; }
  50% { background-color: #ccc; }
  100% { background-color: #fff; }
}

.waiting-move {
  animation: loading 1.5s linear infinite;
}

.board {
  display: grid;
  grid-template-columns: repeat(15, 50px);
  grid-gap: 5px;
  border: 3px solid #000;
  box-shadow: 5px 5px 10 rgba(0,0,0,0.5);
  padding: 10px;
  background-color: rgba(0,0,0,0);
  background-image: url('../assets/image/chessboard.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 98%;
  background-position-x: 50%;
  background-position-y: 50%;
  cursor: url('../assets/image/mouse.png'),auto;
}
.board-row {
  display: contents;
}
.cell {
  width: 50px;
  height: 50px;
  background-color: rgba(0,0,0,0);
  /* background-color: white; */
  border: 0px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.computer-thinking {
  color: #888; 
  font-style: italic;
  margin-top: 20px;
  text-align: center;
}
</style>


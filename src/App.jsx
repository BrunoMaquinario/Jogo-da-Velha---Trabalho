import React, { useState, useEffect } from 'react';
import './App.css';

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // X sempre será o humano
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('X'); // Adicionado para alternar jogadores

  useEffect(() => {
    const storedBoard = localStorage.getItem('board');
    const storedScore = localStorage.getItem('score');

    if (storedBoard) setBoard(JSON.parse(storedBoard));
    if (storedScore) setScore(JSON.parse(storedScore));
  }, []);

  useEffect(() => {
    localStorage.setItem('board', JSON.stringify(board));
    localStorage.setItem('score', JSON.stringify(score));
  }, [board, score]);

  const handleClick = (index) => {
    if (board[index] || gameOver) return;

    const newBoard = board.slice();
    newBoard[index] = currentPlayer; // Usa o jogador atual
    setBoard(newBoard);

    const winner = calculateWinner(newBoard);
    if (winner) {
      updateScore(winner);
      setGameOver(true);
    } else if (newBoard.every(Boolean)) {
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      setGameOver(true);
    } else {
      // Alterna o jogador após cada jogada
      setCurrentPlayer((prev) => (prev === 'X' ? 'O' : 'X'));
      
      // Se o modo de jogo for contra a máquina e o próximo jogador for 'O', chama o movimento da máquina
      if (gameMode === 'computer' && currentPlayer === 'X') {
        setTimeout(() => {
          computerMove(newBoard);
        }, 500); // Delay para simular a jogada da máquina
      }
    }
  };

  const computerMove = (currentBoard) => {
    let move;
    if (difficulty === 'easy') {
      move = getRandomMove(currentBoard);
    } else if (difficulty === 'medium') {
      move = getBestMove(currentBoard, 'O');
      if (move === null) move = getRandomMove(currentBoard);
    } else if (difficulty === 'hard') {
      move = minimax(currentBoard, 'O').index; // Algoritmo Minimax no nível difícil
    }

    if (move !== null) {
      currentBoard[move] = 'O'; // Máquina sempre joga como 'O'
      setBoard(currentBoard);
      const winner = calculateWinner(currentBoard);
      if (winner) {
        updateScore(winner);
        setGameOver(true);
      } else {
        setCurrentPlayer('X'); // Retorna ao jogador humano
      }
    }
  };

  const updateScore = (winner) => {
    setScore((prev) => ({
      ...prev,
      [winner]: prev[winner] + 1,
    }));
  };

  const getRandomMove = (board) => {
    const emptyIndices = board.map((val, index) => (val ? null : index)).filter((val) => val !== null);
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const getBestMove = (board, player) => {
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = player;
        if (calculateWinner(board)) {
          board[i] = null;
          return i;
        }
        board[i] = null; 
      }
    }
    return null;
  };

  const calculateWinner = (board) => {
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Função Minimax para nível difícil
  const minimax = (newBoard, player) => {
    const availSpots = newBoard.map((val, index) => (val ? null : index)).filter((val) => val !== null);

    const winner = calculateWinner(newBoard);
    if (winner === 'X') {
      return { score: -10 };
    } else if (winner === 'O') {
      return { score: 10 };
    } else if (availSpots.length === 0) {
      return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      const move = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === 'O') {
        const result = minimax(newBoard, 'X');
        move.score = result.score;
      } else {
        const result = minimax(newBoard, 'O');
        move.score = result.score;
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = moves[i];
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = moves[i];
        }
      }
    }

    return bestMove;
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setCurrentPlayer('X'); // Resetar o jogador atual para 'X'
  };

  const handleModeChange = (mode) => {
    setGameMode(mode);
    handleReset();
    setDifficulty(null); // Reset difficulty when changing mode
  };

  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    setScore({ X: 0, O: 0, draws: 0 });
    handleReset();
  };

  return (
    <div className="container text-center">
      <h1 className="mt-4">Jogo da Velha</h1>
      {gameMode === null ? (
        <div>
          <h2>Escolha o modo de jogo:</h2>
          <button className="btn btn-primary m-2" onClick={() => handleModeChange('human')}>Jogar com outra pessoa</button>
          <button className="btn btn-primary m-2" onClick={() => handleModeChange('computer')}>Jogar contra a máquina</button>
        </div>
      ) : (
        <div>
          {gameMode === 'computer' && (
            <div>
              <h2>Escolha a dificuldade:</h2>
              <div>
                <button className="btn btn-facil" onClick={() => handleDifficultyChange('easy')}>Fácil</button>
                <button className="btn btn-medio" onClick={() => handleDifficultyChange('medium')}>Médio</button>
                <button className="btn btn-dificil" onClick={() => handleDifficultyChange('hard')}>Difícil</button>
              </div>
              {difficulty && (
                <>
                  <h3>Placar</h3>
                  <p>X: {score.X} - O: {score.O} - Empates: {score.draws}</p>
                  <div className="board mt-3">
                    {board.map((value, index) => (
                      <button key={index} className="square" onClick={() => handleClick(index)}>
                        {value}
                      </button>
                    ))}
                  </div>
                  {gameOver && (
                    <div>
                      <h2>Fim de Jogo!</h2>
                      <button className="btn btn-success" onClick={handleReset}>Jogar Novamente</button>
                    </div>
                  )}
                </>
              )}
              <button className="btn btn-secondary mt-3" onClick={() => handleModeChange(null)}>Voltar ao Menu</button>
              <button className="btn btn-danger mt-3" onClick={handleReset}>Resetar Jogo</button>
            </div>
          )}
          {gameMode === 'human' && (
            <>
              <h3>Placar</h3>
              <p>X: {score.X} - O: {score.O} - Empates: {score.draws}</p>
              <div className="board mt-3">
                {board.map((value, index) => (
                  <button key={index} className="square" onClick={() => handleClick(index)}>
                    {value}
                  </button>
                ))}
              </div>
              {gameOver && (
                <div>
                  <h2>Fim de Jogo!</h2>
                  <button className="btn btn-success" onClick={handleReset}>Jogar Novamente</button>
                </div>
              )}
              <button className="btn btn-secondary mt-3" onClick={() => handleModeChange(null)}>Voltar ao Menu</button>
              <button className="btn btn-danger mt-3" onClick={handleReset}>Resetar Jogo</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

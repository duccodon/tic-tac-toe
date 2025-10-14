import { useState } from 'react';

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={isWinningSquare ? { backgroundColor: 'lightgreen' } : {}}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, boardSize }) {
  function handleClick(i) {
    if (calculateWinner(squares, boardSize).winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  const { winner, winningSquares } = calculateWinner(squares, boardSize);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (!squares.includes(null)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      {Array(boardSize)
        .fill(null)
        .map((_, row) => (
          <div key={row} className="board-row">
            {Array(boardSize)
              .fill(null)
              .map((_, col) => {
                const i = row * boardSize + col;
                return (
                  <Square
                    key={i}
                    value={squares[i]}
                    onSquareClick={() => handleClick(i)}
                    isWinningSquare={winningSquares && winningSquares.includes(i)}
                  />
                );
              })}
          </div>
        ))}
    </>
  );
}

export default function Game() {
  const [boardSize, setBoardSize] = useState(3);
  const [history, setHistory] = useState([{ squares: Array(boardSize * boardSize).fill(null), moveIndex: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [message, setMessage] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, moveIndex }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleIncrease() {
    const newSize = boardSize + 1;
    setBoardSize(newSize);
    setHistory([{ squares: Array(newSize * newSize).fill(null), moveIndex: null }]);
    setCurrentMove(0);
  }

  function handleDecrease() {
    if (boardSize <= 2) {
      setMessage('Cannot decrease board size below 2.');
      setTimeout(() => setMessage(null), 5000);
    } else {
      const newSize = boardSize - 1;
      setBoardSize(newSize);
      setHistory([{ squares: Array(newSize * newSize).fill(null), moveIndex: null }]);
      setCurrentMove(0);
    }
  }

  function handleToggleSort() {
    setIsAscending(!isAscending);
  }

  function getMoveLocation(moveIndex) {
    if (moveIndex === null) return '';
    const row = Math.floor(moveIndex / boardSize);
    const col = moveIndex % boardSize;
    return ` (${row}, ${col})`;
  }

  const moves = history.map(({ squares, moveIndex }, move) => {
    if (move === currentMove) {
      const description = move > 0 ? `You are at move #${move}${getMoveLocation(moveIndex)}` : 'You are at game start';
      return <li key={move}>{description}</li>;
    } else {
      const description = move > 0 ? `Go to move #${move}${getMoveLocation(moveIndex)}` : 'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    }
  });

  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      {message && (
        <div className="message">
          {message}
          <button onClick={() => setMessage(null)}>Close</button>
        </div>
      )}
      <div className="controls">
        Board size: {boardSize}
        <button onClick={handleIncrease}>+</button>
        <button onClick={handleDecrease}>-</button>
        <button onClick={handleToggleSort}>
          Sort: {isAscending ? 'Ascending' : 'Descending'}
        </button>
      </div>
      <div className="game-content">
        <div className="game-board">
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
            boardSize={boardSize}
          />
        </div>
        <div className="game-info">
          <ol>{sortedMoves}</ol>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares, boardSize) {
  const n = boardSize;

  // Check rows
  for (let row = 0; row < n; row++) {
    const start = row * n;
    if (squares[start]) {
      let allSame = true;
      for (let col = 1; col < n; col++) {
        if (squares[start + col] !== squares[start]) {
          allSame = false;
          break;
        }
      }
      if (allSame) {
        return {
          winner: squares[start],
          winningSquares: Array(n)
            .fill(null)
            .map((_, col) => start + col),
        };
      }
    }
  }

  // Check columns
  for (let col = 0; col < n; col++) {
    const start = col;
    if (squares[start]) {
      let allSame = true;
      for (let row = 1; row < n; row++) {
        if (squares[start + row * n] !== squares[start]) {
          allSame = false;
          break;
        }
      }
      if (allSame) {
        return {
          winner: squares[start],
          winningSquares: Array(n)
            .fill(null)
            .map((_, row) => col + row * n),
        };
      }
    }
  }

  // Check main diagonal
  if (squares[0]) {
    let allSame = true;
    for (let i = 1; i < n; i++) {
      if (squares[i * (n + 1)] !== squares[0]) {
        allSame = false;
        break;
      }
    }
    if (allSame) {
      return {
        winner: squares[0],
        winningSquares: Array(n)
          .fill(null)
          .map((_, i) => i * (n + 1)),
      };
    }
  }

  // Check anti-diagonal
  if (squares[n - 1]) {
    let allSame = true;
    for (let i = 1; i < n; i++) {
      if (squares[(n - 1) + i * (n - 1)] !== squares[n - 1]) {
        allSame = false;
        break;
      }
    }
    if (allSame) {
      return {
        winner: squares[n - 1],
        winningSquares: Array(n)
          .fill(null)
          .map((_, i) => (n - 1) + i * (n - 1)),
      };
    }
  }

  return { winner: null, winningSquares: null };
}
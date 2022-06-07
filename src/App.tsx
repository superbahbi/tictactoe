import React, { useEffect } from 'react';
import './App.css';

const defaultBoard = ["", "", "", "", "", "", "", "", ""];
const winState = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

function App() {
  const [gameState, setGameState] = React.useState<boolean | null>(null);
  const [board, setBoard] = React.useState<string[]>(defaultBoard);
  const [turn, setTurn] = React.useState("x");
  const [winner, setWinner] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);
  const onHandleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    let id = e.currentTarget.id;
    let newBoard = [...board];
    newBoard[parseInt(id)] = turn;
    setBoard(newBoard);
    setTurn(turn === "x" ? "o" : "x");
  };
  const onHandleStartGame = () => {
    if (gameState === true || disabled === false) {
      setBoard(defaultBoard)
      setWinner("")
    } else {
      setGameState(true);
      setDisabled(false);
    }

  }
  useEffect(() => {
    winState.forEach(state => {
      state.every(i => board[i] === "x") && setWinner("x");
    })
    winState.forEach(state => {
      state.every(i => board[i] === "o") && setWinner("o");
    })
  }, [board]);
  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe</h1>
      <h3>{winner ? `Player ${winner} wins` : `Good luck`}</h3>
      <div className="board">
        {board.map((row, index) => {
          return <button className="square" disabled={disabled} key={index} onClick={onHandleClick} id={index.toString()}>
            <span className="letter">
              {row}
            </span>
          </button>
        })}
      </div>
      <button onClick={onHandleStartGame}>{disabled ? "Start Game" : "Reset"}</button>
    </div>
  );
}

export default App;

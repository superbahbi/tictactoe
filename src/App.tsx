import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
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
  const [socket, setSocket] = React.useState<any>(null);
  const [gameState, setGameState] = React.useState<boolean | null>(null);
  const [board, setBoard] = React.useState<string[]>(defaultBoard);
  const [turn, setTurn] = React.useState("x");
  const [winner, setWinner] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);
  const [room, setRoom] = React.useState("");
  const [roomInput, setRoomInput] = React.useState("");
  const [playerMove, setPlayerMove] = React.useState("");
  const onHandleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    let id = e.currentTarget.id;
    if (turn === playerMove) {
      let newBoard = [...board];
      if (newBoard[parseInt(id)] === "" && winner === "") {
        newBoard[parseInt(id)] = turn;
      }
      setBoard(newBoard);
      var data = {
        turn: playerMove === "x" ? "o" : "x",
        board: newBoard
      }
      setTurn(playerMove === "x" ? "o" : "x");
      socket.emit("emitMessage", data);
    }

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
  const onSocketMakeRoom = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setRoom(id)
    setPlayerMove("x")
    setTurn("x")
    socket.emit("join", id);
  }
  const onSocketJoinRoom = () => {
    setPlayerMove("o")
    roomInput && socket.emit("join", roomInput);
  }
  useEffect((): (() => void) => {
    const newSocket = socketIOClient("http://localhost:3001");
    setSocket(newSocket);
    newSocket.on("onMessage", data => {
      setTurn(data.turn);
      setBoard(data.board);
      console.log(data)
    });
    return () => newSocket.disconnect();
  }, []);
  useEffect(() => {
    winState.forEach(state => {
      state.every(i => board[i] === "x") && setWinner("x");
    })
    winState.forEach(state => {
      state.every(i => board[i] === "o") && setWinner("o");
    })
  }, [board, turn]);
  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe</h1>
      <h3>{winner ? `Player ${winner} wins` : `Good luck`}</h3>
      <p>{room && `Room id: ${room}`}</p>
      <p> {`Player ${turn.toUpperCase()} turn`}</p>
      <p>{`You are playing as ${playerMove}`}</p>
      <div className="board">
        {board.map((row, index) => {
          return <button className="square" disabled={false} key={index} onClick={onHandleClick} id={index.toString()}>
            <span className="letter">
              {row}
            </span>
          </button>
        })}
      </div>
      <button onClick={onHandleStartGame}>{disabled ? "Start Game" : "Reset"}</button>
      <div>
        {!room && <button onClick={onSocketMakeRoom}>Make a room</button>}
      </div>
      <div>
        {
          !room &&
          <><input onChange={e => setRoomInput(e.target.value)} />
            <button onClick={onSocketJoinRoom}>Join room</button>
          </>
        }
      </div>

    </div>
  );
}

export default App;

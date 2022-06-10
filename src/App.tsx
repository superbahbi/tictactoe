import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { 
  useToken,
  useClipboard, 
  Flex,
  Input,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Box,
  Code
} from '@chakra-ui/react'
import './App.css';

const ENDPOINT: any = "http://localhost:3001";
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

const App : React.FC =()=> {
  const [socket, setSocket] = React.useState<any>(null);
  const [gameState, setGameState] = React.useState<boolean | null>(null);
  const [board, setBoard] = React.useState<string[]>(defaultBoard);
  const [turn, setTurn] = React.useState("x");
  const [winner, setWinner] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);
  const [room, setRoom] = React.useState("");
  const [roomInput, setRoomInput] = React.useState("");
  const [playerMove, setPlayerMove] = React.useState("");

  const { hasCopied, onCopy } = useClipboard(room)
  const [red100, blue200] = useToken(
    // the key within the theme, in this case `theme.colors`
    'colors',
    // the subkey(s), resolving to `theme.colors.red.100`
    ['red.100', 'blue.200'],
    // a single fallback or fallback array matching the length of the previous arg
  )

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
    setRoom(socket.id)
    setPlayerMove("x")
    setTurn("x")
    socket.emit("join", socket.id);
  }

  const onSocketJoinRoom = () => {
    setPlayerMove("o")
    setRoom(roomInput)
    roomInput && socket.emit("join", roomInput);
  }

  useEffect((): (() => void) => {
    console.log(ENDPOINT)
    const newSocket = socketIOClient(ENDPOINT);
    console.log(newSocket)
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
      <h1 className="title">Tic Tac Toe MMO</h1>
      <h3>{winner && `Player ${winner} wins`}</h3>
      {/* <p> {room && `Player ${turn.toUpperCase()} turn`}</p> */}
      <div className="board">
        {board.map((row, index) => {
          return <button className="square" disabled={false} key={index} onClick={onHandleClick} id={index.toString()}>
            <span className="letter">
              {row}
            </span>
          </button>
        })}
      </div>
      <p>{room && `You are playing as ${playerMove}`}</p>

      <div className="input">
        <>
          {room ? 
          <>
          <div>
            <Input value={room} isReadOnly />
            </div>
          <div>
            <Button onClick={onCopy} ml={2}>{hasCopied ? 'Copied' : 'Copy'}</Button>
          </div>
          </>
          :
          <>
          <div>
            <Input onChange={e => setRoomInput(e.target.value)} />
            </div>
          <div>
            <Button onClick={onSocketJoinRoom} ml={2}>Join room</Button>
          </div>
          </>
          }
        
     
        </>
      <div>
        <Button onClick={onSocketMakeRoom}>Make a room</Button>
      </div>
      </div>
    </div>
  );
}
export default App;
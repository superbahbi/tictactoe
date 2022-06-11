import React, { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import { 
  useClipboard, 
  Input,
  Button,

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
type lobbyType = {
  room: string,
  players: Array<string>,
  gameState: typeof defaultBoard,
  turn: string,
}

const App : React.FC =()=> {
  const inputRef = useRef<HTMLInputElement | any>(null);
  const [socket, setSocket] = React.useState<any>(null);
  const [turn, setTurn] = React.useState("x");
  const [winner, setWinner] = React.useState("");
  const [room, setRoom] = React.useState<string>("");
  const [roomInput, setRoomInput] = React.useState("");
  const [playerMove, setPlayerMove] = React.useState("");
  const [lobby, setLobby] = React.useState<lobbyType>();
  const { hasCopied, onCopy } = useClipboard(room)

  const onHandleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    let id = e.currentTarget.id;
    console.log(lobby)
    if (lobby?.turn === playerMove && lobby?.players.length === 2) {
      
      let newBoard = [...lobby.gameState];
      if (newBoard[parseInt(id)] === "" && winner === "") {
        newBoard[parseInt(id)] = lobby.turn;
      }
      lobby["gameState"] = newBoard;
      lobby["turn"] = playerMove === "x" ? "o" : "x";
      setTurn(playerMove === "x" ? "o" : "x");
      socket.emit("emitMessage", lobby);
    }
  };

  const onSocketMakeRoom = () => {
    
    const id = Math.random().toString(36).substr(2, 9);
    console.log(inputRef.current)
    if (inputRef.current) {
      inputRef.current = id;
    }
    setRoom(id)
    setPlayerMove("x")
    setTurn("x")
    socket.emit("create", id);
  }

  const onSocketJoinRoom = () => {
    setPlayerMove("o")
    setRoom(roomInput)
    roomInput && socket.emit("join", roomInput);
  }

  useEffect((): (() => void) => {
    const newSocket = socketIOClient(ENDPOINT);
    setSocket(newSocket);
    newSocket.on("onMessage", data => {
      setLobby(data)
      setTurn(data.turn);
    });
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    winState.forEach(state => {
      state.every(i => lobby?.gameState[i] === "x") && setWinner("x");
    })
    winState.forEach(state => {
      state.every(i => lobby?.gameState[i] === "o") && setWinner("o");
    })
  }, [lobby, turn]);
  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe MMO</h1>
      <h3>{winner && `Player ${winner} wins`}</h3>
      <p> {room && `Player ${turn.toUpperCase()} turn`}</p>
      <p>{room && `You are playing as ${playerMove}`}</p>
      <p>{`Lobby ${lobby?.players ? lobby?.players.length : 0  }/2`}</p>
    {room && <div className="board">
      {lobby?.gameState.map((row, index) => {
        return <button className="square" disabled={false} key={index} onClick={onHandleClick} id={index.toString()}>
          <span className="letter">
            {row}
          </span>
        </button>
      })}
    </div>}
     

      <div className="input">
        <>
          {room  ? 
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
            <Input  onChange={e => setRoomInput(e.target.value)} />
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
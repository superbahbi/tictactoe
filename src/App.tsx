import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { 
  useClipboard, 
  Input,
  Button,

} from '@chakra-ui/react'
import './App.css';
import useSound from 'use-sound';


const popUpOff = require("../src/sounds/pop-up-off.mp3");
const ENDPOINT: any = "http://localhost:3001";
const defaultBoard = ["", "", "", "", "", "", "", "", ""];

type lobbyType = {
  room: string,
  players: Array<string>,
  gameState: typeof defaultBoard,
  turn: string,
  winner: string,
}

const App : React.FC =()=> {
  const [socket, setSocket] = React.useState<any>(null);
  const [turn, setTurn] = React.useState("x");
  const [room, setRoom] = React.useState<string>("");
  const [roomInput, setRoomInput] = React.useState("");
  const [playerMove, setPlayerMove] = React.useState("");
  const [lobby, setLobby] = React.useState<lobbyType>();
  const { hasCopied, onCopy } = useClipboard(room)
  const [toggle, setToggle] = React.useState(false)

  const [PlaySound] = useSound(popUpOff, { id: 'off', volume: 0.25 });

  const onHandleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    let id = e.currentTarget.id;
    setToggle(!toggle)
    if (lobby?.turn === playerMove && lobby?.players.length === 2) {
      PlaySound();
      let newBoard = [...lobby.gameState];
      if (newBoard[parseInt(id)] === "" && lobby?.winner === "") {
        newBoard[parseInt(id)] = lobby.turn;
      }
      lobby["gameState"] = newBoard;
      lobby["turn"] = playerMove === "x" ? "o" : "x";
      setTurn(playerMove === "x" ? "o" : "x");
      socket.emit("lobbyData", lobby);
      
    }
  };

  const onSocketMakeRoom = () => {
    const id = Math.random().toString(36).substr(2, 9);
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
    newSocket.on("updateBoard", data => {
      setLobby(data)
      setTurn(data.turn);
    });
    return () => newSocket.disconnect();
  }, []);

  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe MMO</h1>
      <h3>{lobby?.winner && `Player ${lobby.winner} wins`}</h3>
      <p> {room && `Player ${turn.toUpperCase()} turn`}</p>
      <p>{room && `You are playing as ${playerMove}`}</p>
      <p>{room && `Lobby ${lobby?.players ? lobby?.players.length : 0  }/2`}</p>
    {room && <div className="board">
      {lobby?.gameState.map((row, index) => {
        return <button
          id={index.toString()}
          className="square" 
          disabled={false} 
          key={index} 
          onClick={onHandleClick} 
          >
          {row && <span className="letter">
            {row}
          </span>}
        </button>
      })}
    </div>}
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
import {BrowserRouter, Route, Routes, useParams} from "react-router-dom";
import Overview from "./lobby/Overview";
import CreateLobby from "./lobby/CreateLobby";
import {useEffect, useState} from "react";

export default () => {
  const [socket, setSocket] = useState<WebSocket>();

  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Overview/>}/>
        <Route path={"/new"} element={<CreateLobby/>}/>
        <Route path={"/:id"} element={<LobbyContext socket={socket} setSocket={setSocket}/>}/>
      </Routes>
    </BrowserRouter>
  );
}

const LobbyContext = ({socket, setSocket}: { socket: WebSocket | undefined, setSocket: (socket: WebSocket) => void }) => {
  const params = useParams();
  const [connectionStatus, setConnectionStatus] = useState("Initializing");

  useEffect(() => {
    if (!socket) {
      socket = new WebSocket(`ws://localhost:5000/gateway/join/${params.id}?name=test`);
      socket.onmessage = event => {
        setConnectionStatus("Received");
        console.log(event.data);
      };
      socket.onopen = event => {
        setConnectionStatus("Connected");
        console.log("open");
      };
      socket.onclose = event => {
        setConnectionStatus("Failed");
        console.log("closed", event.code, event.reason);
      };
      setSocket(socket);
      setConnectionStatus("Connecting");
    }
  }, [socket]);

  return (
    <div>
      {connectionStatus ? connectionStatus + ".." : <></>}
    </div>
  );
};


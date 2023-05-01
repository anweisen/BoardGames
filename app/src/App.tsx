import {BrowserRouter, Outlet, Route, Routes, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {InitLobbyPayload, PlayerInfo, RefuseLobbyPayload, RefuseReason, SocketMessage, SocketMessageType} from "@board-games/core";
import Overview from "./lobby/Overview";
import CreateLobby from "./lobby/CreateLobby";
import LobbyScreen from "./lobby/LobbyScreen";

export default () => {
  // const [socket, setSocket] = useState<WebSocket>();
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route element={<ResetConnection socket={socket} setSocket={setSocket}/>}>*/}
        <Route path={"/"} element={<Overview/>}/>
        {/*<Route path={"/new"} element={<CreateLobby setSocket={setSocket}/>}/>*/}
        {/*</Route>*/}

        {/*<Route path={"/:id"} element={<LobbyContext socket={socket} setSocket={setSocket}/>}/>;*/}
        <Route path={"/:id"} element={<LobbyContext/>}/>;
      </Routes>
    </BrowserRouter>
  );
}

const ResetConnection = ({socket, setSocket}: { socket: WebSocket | undefined, setSocket: (val: any) => void }) => {
  useEffect(() => {
    socket?.close();
    setSocket(undefined);
  }, []);
  return <Outlet/>;
};

type SocketHandler = (type: SocketMessageType, data: any) => void;

// const LobbyContext = ({socket, setSocket}: { socket: WebSocket | undefined, setSocket: (socket: WebSocket) => void }) => {
const LobbyContext = () => {
  const params = useParams();
  const navigate = useNavigate();
  let [socket, setSocket] = useState<WebSocket>();
  const [initPayload, setInitPayload] = useState<InitLobbyPayload>();
  const [refused, setRefused] = useState<RefuseLobbyPayload>();

  const socketHandler: Record<string, SocketHandler> = {};
  socketHandler[SocketMessageType.INIT_LOBBY] = (type, data: InitLobbyPayload) => {
    setInitPayload(data);
    navigate(`../${data.lobbyId}`);
  };
  socketHandler[SocketMessageType.REFUSE_LOBBY] = (type, data) => {
    setRefused(data as RefuseLobbyPayload);
  };
  socketHandler[SocketMessageType.JOIN] = (type, data) => {
    initPayload?.players.push(data as PlayerInfo);
    setInitPayload(initPayload);
  };

  const connectSocket = (url: string) => {
    socket = new WebSocket(url);
    socket.onmessage = event => {
      console.log(event.data);

      const text = event.data.toString();
      const json: SocketMessage = JSON.parse(text);

      const handler = socketHandler[json.t];
      if (handler) handler(json.t, json.d);
    };
    socket.onopen = event => {
      console.log("open");
    };
    socket.onclose = event => {
      console.log("closed", event.code, event.reason);
    };
    setSocket(socket);
    setRefused(undefined);
  };

  useEffect(() => {
    if (!socket && params.id !== "new") {
      connectSocket(`ws://localhost:5000/gateway/join/${params.id}?name=${Date.now()}`);
    } else if (params.id === "new") {
      socket?.close();
      setSocket(undefined);
      console.log("reset");
      setInitPayload(undefined);
    }
  }, [params.id]);

  console.log(initPayload);
  return (
    <div>
      {params.id === "new" ? <CreateLobby connectSocket={connectSocket}/> : <>
        {refused ? <LobbyRefused reason={refused.reason}/> : initPayload ?
          <LobbyScreen payload={initPayload}/> : <>Connecting={initPayload === undefined}{JSON.stringify(initPayload)}</>}
      </>}
    </div>
  );
};

const LobbyRefused = ({reason}: { reason: RefuseReason }) => {
  return (
    <div className={"Refused"}>
      REFUSED:{reason.toString()}
    </div>
  );
};

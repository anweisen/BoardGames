import {BrowserRouter, Route, Routes, useParams} from "react-router-dom";
import React, {MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import {GameType, InitLobbyPayload, PlayerInfo, RefuseLobbyPayload, RefuseReason, SocketMessage, SocketMessageType} from "@board-games/core";
import Overview from "./lobby/Overview";
import CreateLobby from "./lobby/CreateLobby";
import LobbyScreen from "./lobby/LobbyScreen";
import UnoView from "./games/uno/UnoView";

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Overview/>}/>
        <Route path={"/new"} element={<CreateLobby/>}/>
        <Route path={"/:id"} element={<LobbyContext/>}/>;
      </Routes>
    </BrowserRouter>
  );
}

export interface Connection {
  sendPacket(type: SocketMessageType, data: object): void;
}

export type SocketHandler = (type: SocketMessageType, data: any) => void;
export type SocketHandlers = Record<string, SocketHandler>

const LobbyContext = () => {
  const params = useParams();
  const [socket, setSocket] = useState<WebSocket>();
  const [initPayload, setInitPayload] = useState<InitLobbyPayload>();
  const [refused, setRefused] = useState<RefuseLobbyPayload>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [inLobby, setInLobby] = useState(true);
  const connectionRef = useRef<Connection>() as MutableRefObject<Connection>;
  const handlerRef = useRef<SocketHandlers>({}) as MutableRefObject<SocketHandlers>;

  useCallback(() => {
    if (!socket) {// @ts-ignore
      connectionRef.current = undefined;
    }
  }, [socket]);

  handlerRef.current[SocketMessageType.INIT_LOBBY] = (type, data: InitLobbyPayload) => {
    setInitPayload(data);
    setPlayers(data.players);
  };
  handlerRef.current[SocketMessageType.REFUSE_LOBBY] = (type, data: RefuseLobbyPayload) => {
    setRefused(data);
  };
  handlerRef.current[SocketMessageType.JOIN] = (type, data: PlayerInfo) => {
    setPlayers(prev => [...prev, data]);
  };
  handlerRef.current[SocketMessageType.LEAVE] = (type, data: PlayerInfo) => {
    setPlayers(prev => prev.filter(cur => cur.id !== data.id));
  };
  handlerRef.current[SocketMessageType.PREPARE_START] = (type, data) => {
    setInLobby(false);
  };

  const connectSocket = (url: string) => {
    const socket = new WebSocket(url);
    socket.onmessage = event => {
      const text = event.data.toString();
      const json: SocketMessage = JSON.parse(text);
      console.log(json);

      const handler = handlerRef.current[json.t];
      if (handler) handler(json.t, json.d);
    };
    socket.onopen = event => {
      console.log("WS: open");
    };
    socket.onclose = event => {
      console.log("WS: closed", event.code, event.reason);
      setSocket(undefined);
    };
    setSocket(socket);
    setRefused(undefined);
    connectionRef.current = {
      sendPacket(type: SocketMessageType, data: object) {
        socket?.send(JSON.stringify({t: type, d: data}));
      }
    };
  };

  useEffect(() => {
    if (!socket) {
      connectSocket(`ws://localhost:5000/gateway/join/${params.id}?name=${Date.now()}`);
    }
  }, [params.id]);

  return (
    <div style={{display: "grid", placeItems: "center", height: "100%", color: "white"}}>
      {refused ? <LobbyRefused reason={refused.reason}/> :
        (!connectionRef.current || !socket ? <>LOST CON</> :
          (!initPayload ? <LobbyConnecting/> :
            (inLobby ? <LobbyScreen payload={initPayload} players={players} connection={connectionRef}/> :
                (initPayload.game === GameType.UNO && <UnoView connection={connectionRef} handler={handlerRef}/>)
            )))
      }
    </div>
  );
};

const LobbyConnecting = () => {
  return (
    <div className={"Connecting"}>
      Connecting..
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

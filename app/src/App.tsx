import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes, useParams} from "react-router-dom";
import {GameType, InitLobbyPayload, PlayerInfo, RefuseLobbyPayload, RefuseReason, SocketMessage, SocketMessageType} from "@board-games/core";
import Overview from "./lobby/Overview";
import CreateLobby from "./lobby/CreateLobby";
import LobbyScreen from "./lobby/LobbyScreen";
import UnoView from "./games/uno/UnoView";
import JoinLobby from "./lobby/JoinLobby";
import LobbyLoading from "./lobby/LobbyLoading";
import config from "./config";
import {useCookies} from "react-cookie";

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
  const [closed, setClosed] = useState<any>();
  const [initPayload, setInitPayload] = useState<InitLobbyPayload>();
  const [refused, setRefused] = useState<RefuseLobbyPayload>();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [inLobby, setInLobby] = useState(true);
  const [playerName, setPlayerName] = useState<string>();
  const connectionRef = useRef<Connection>() as MutableRefObject<Connection>;
  const handlerRef = useRef<SocketHandlers>({}) as MutableRefObject<SocketHandlers>;

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
    console.log("Connecting to", url);
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
      // @ts-ignore
      connectionRef.current = undefined;
      setSocket(undefined);
      setClosed(event.code);
    };
    setSocket(socket);
    setRefused(undefined);
    connectionRef.current = {
      sendPacket(type: SocketMessageType, data: object) {
        socket?.send(JSON.stringify({t: type, d: data}));
      }
    };
  };

  return (
    <>
      {refused ? <LobbyRefused reason={refused.reason}/> :
        (!socket && !closed ? <JoinLobby join={name => {
            setPlayerName(name);
            connectSocket(`${config.ws}/gateway/join/${params.id}?name=${encodeURIComponent(name)}`);
          }}/> :
          (!connectionRef.current && false ? <LobbyDisconnected/> :
            (!initPayload || !playerName ? <LobbyLoading/> :
              (inLobby ? <LobbyScreen payload={initPayload} players={players} playerName={playerName} connection={connectionRef}/> :
                  (initPayload.game === GameType.UNO && <UnoView connection={connectionRef} handler={handlerRef} players={players} selfId={initPayload.playerId}/>)
              ))))
      }
    </>
  );
};

const LobbyRefused = ({reason}: { reason: RefuseReason }) => {
  const [cookies, setCookies] = useCookies(["player_name"]);

  useEffect(() => {
    if (reason === RefuseReason.INVALID_NAME) {
      setCookies("player_name", undefined);
    }
  }, [cookies.player_name, reason]);

  return (
    <div className={"LobbyRefused"}>
      <Navigate to={"../"}/>
    </div>
  );
};
const LobbyDisconnected = () => {
  return (
    <div className={"Disconnected"}>
      <Navigate to={"../"}/>
    </div>
  );
};

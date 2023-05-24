import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {BrowserRouter, Navigate, Route, Routes, useParams} from "react-router-dom";
import {useCookies} from "react-cookie";
import {GameType, InitLobbyPayload, PlayerInfo, RefuseLobbyPayload, RefuseReason, SocketMessage, SocketMessageType} from "@board-games/core";
import Overview from "./lobby/Overview";
import CreateLobby from "./lobby/CreateLobby";
import LobbyScreen from "./lobby/LobbyScreen";
import JoinLobby from "./lobby/JoinLobby";
import LobbyLoading from "./lobby/LobbyLoading";
import UnoView from "./games/uno/UnoView";
import config from "./config";

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Overview/>}/>
        <Route path={"/new/:game?"} element={<CreateLobby/>}/>
        <Route path={"/:id"} element={<LobbyContext/>}/>;
      </Routes>
    </BrowserRouter>
  );
}

export interface Connection {
  sendPacket(type: SocketMessageType, data: object): void;

  intervalId?: any;
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
      clearInterval(connectionRef.current?.intervalId);
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
    connectionRef.current.intervalId = setInterval(con => {
      con.sendPacket(SocketMessageType.HEARTBEAT, {at: Date.now()});
    }, 15_000, connectionRef.current);
  };

  const game = !initPayload ? undefined : (
    initPayload.game === GameType.UNO ? <UnoView connection={connectionRef} handler={handlerRef} players={players} selfId={initPayload.playerId}/> : undefined
  );

  return (
    <>
      {refused ? <LobbyRefused reason={refused.reason}/> :
        (!socket && !closed ? <JoinLobby join={name => {
            setPlayerName(name);
            connectSocket(`${config.ws}/gateway/join/${params.id}?name=${encodeURIComponent(name)}`);
          }}/> :
          (!connectionRef.current && false ? <LobbyDisconnected/> :
            (!initPayload || !playerName ? <LobbyLoading/> :
              (inLobby ? <LobbyScreen payload={initPayload} players={players} playerName={playerName} connection={connectionRef}/> : game))))
      }
    </>
  );
};

const LobbyRefused = ({reason}: { reason: RefuseReason }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["player_name"]);

  useEffect(() => {
    if (reason === RefuseReason.INVALID_NAME) {
      removeCookie("player_name");
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

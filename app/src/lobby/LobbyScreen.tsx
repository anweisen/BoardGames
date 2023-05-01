import {InitLobbyPayload} from "@board-games/core";
import "./LobbyScreen.scss";

export default ({payload}:{payload:InitLobbyPayload}) => {
  return (
    <div>
      {JSON.stringify(payload)}
    </div>
  )
}
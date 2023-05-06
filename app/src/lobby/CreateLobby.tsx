import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import config from "../config";
import "./CreateLobby.scss";
import {useEffect} from "react";

export default () => {
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["player_name"]);

  return (
    <div className={"CreateLobby"}>
      <div className={"Panel"}>

        <div className={"InputGroup"}>
          <span className={"Label"}>Lobby Name</span>
          <input id={"lobby-name"} className={"Input"} placeholder={"The Lobby Name"}/>
        </div>

        <div className={"InputGroup"}>
          <span className={"Label"}>Your Name</span>
          <input id={"player-name"} className={"Input"} placeholder={"What's your name?"} defaultValue={cookie.player_name}/>
        </div>

        <div className={"Buttons"}>
          <div className={"Button Cancel"} onClick={() => navigate("../")}>Go Back</div>
          <div className={"Button Confirm"} onClick={() => {
            // @ts-ignore
            const playerName = document.getElementById("player-name").value;
            // @ts-ignore
            const lobbyName = document.getElementById("lobby-name").value;

            setCookie("player_name", playerName);
            fetch(`${config.api}/gateway/create`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({lobbyName: lobbyName, game: "UNO"})})
              .then(value => value.json())
              .then(value => navigate("../" + value.id));
          }}>Create Lobby
          </div>
        </div>
      </div>
    </div>
  );
}
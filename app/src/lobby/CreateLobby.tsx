import {Navigate, useNavigate, useParams} from "react-router-dom";
import {useCookies} from "react-cookie";
import {useState} from "react";
import config from "../config";
import "./CreateJoinLobby.scss";

export default () => {
  const params = useParams();
  const [game, setGame] = useState(params.game);

  return params.game ? <CreateLobbyPanel/> : <Navigate to={"./uno"}/>;
}

const CreateLobbyPanel = () => {
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies(["player_name"]);
  const [clicked, setClicked] = useState(false);

  return (
    <div className={"CreateLobby"}>
      <div className={"Panel"}>

        {/* <div className={"InputGroup"}>
          <span className={"Label"}>Game</span>
        </div> */}

        <div className={"InputGroup"}>
          <span className={"Label"}>Your Name</span>
          <input id={"player-name"} className={"Input"} placeholder={"What's your name?"} defaultValue={cookie.player_name ? cookie.player_name : undefined} spellCheck={false}/>
        </div>

        <div className={"InputGroup"}>
          <span className={"Label"}>Lobby Name</span>
          <input id={"lobby-name"} className={"Input"} placeholder={"The Lobby Name"} defaultValue={cookie.player_name ? cookie.player_name + "'s Lobby" : undefined} spellCheck={false}/>
        </div>

        <div className={"Buttons"}>
          <div className={"Button Cancel"} onClick={() => navigate("/")}>Go Back</div>
          <div className={"Button Confirm"} onClick={() => {
            if (clicked) return; // @ts-ignore
            const playerName = document.getElementById("player-name")?.value; // @ts-ignore
            const lobbyName = document.getElementById("lobby-name")?.value;
            if (!playerName || !lobbyName) return;

            setClicked(true);
            setCookie("player_name", playerName, {maxAge: 30 * 24 * 60 * 60});
            fetch(`${config.api}/gateway/create`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({lobbyName: lobbyName, game: "uno"})})
              .then(value => value.json())
              .then(value => navigate("/" + value.id))
              .catch(_ => setClicked(false));
          }}>Create Lobby
          </div>
        </div>
      </div>
    </div>
  );
};
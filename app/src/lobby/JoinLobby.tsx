import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import "./CreateJoinLobby.scss";

export default ({join}: { join: (name: string) => void }) => {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);
  const [cookie, setCookie] = useCookies(["player_name"]);

  useEffect(() => {
    if (cookie.player_name && cookie.player_name != "undefined") { // this is stupid
      console.log("COOKIES: Found Name:", cookie.player_name);
      join(cookie.player_name);
    }
  }, [cookie, join]);

  return (
    <div className={"JoinLobby"}>
      <div className={"Panel"}>
        <div className={"InputGroup"}>
          <span className={"Label"}>Your Name</span>
          <input id={"player-name"} className={"Input"} placeholder={"What's your name?"} defaultValue={cookie.player_name} spellCheck={false}/>
        </div>

        <div className={"Buttons"}>
          <div className={"Button Cancel"} onClick={() => navigate("../")}>Go Back</div>
          <div className={"Button Confirm"} onClick={() => {
            if (clicked) return; // @ts-ignore
            const playerName = document.getElementById("player-name").value;

            setClicked(true);
            setCookie("player_name", playerName, {maxAge: 30 * 24 * 60 * 60});
            join(playerName);
          }}>Join Lobby
          </div>
        </div>
      </div>

    </div>
  );
}
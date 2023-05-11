import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import "./CreateJoinLobby.scss";

export default ({join}: { join: (name: string) => void }) => {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);
  const [cookie, setCookie] = useCookies(["player_name"]);

  useEffect(() => {
    if (cookie.player_name != undefined && cookie.player_name != "undefined") { // this is stupid
      console.log("COOKIES: Found Name:", cookie.player_name);
      join(cookie.player_name);
    }
  }, [cookie, join]);

  return (
    <div className={"JoinLobby"}>
      <div className={"Panel"}>
        <div className={"InputGroup"}>
          <span className={"Label"}>Your Name</span>
          <input id={"player-name"} className={"Input"} placeholder={"What's your name?"} defaultValue={cookie.player_name != "undefined" ? undefined : cookie.player_name}/>
        </div>

        <div className={"Buttons"}>
          <div className={"Button Cancel"} onClick={() => navigate("../")}>Go Back</div>
          <div className={"Button Confirm"} onClick={() => {
            if (clicked) return;
            // @ts-ignore
            const playerName = document.getElementById("player-name").value;

            setClicked(true);
            setCookie("player_name", playerName, {maxAge:7*24*60*60});
            join(playerName);
          }}>Join Lobby
          </div>
        </div>
      </div>

    </div>
  );
}
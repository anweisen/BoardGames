import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";

export default ({join}: { join: (name: string) => void }) => {
  const [clicked, setClicked] = useState(false);
  const [cookie, setCookie] = useCookies(["player_name"]);

  useEffect(() => {
    if (cookie.player_name) {
      console.log("COOKIES: Found Name:", cookie.player_name);
      join(cookie.player_name);
    }
  }, [cookie, join]);

  return (
    <div className={"JoinLobby"}>
      <div onClick={() => {
        setCookie("player_name", "Angelo");
        join("Angelo");
      }}>CLICK
      </div>
    </div>
  );
}
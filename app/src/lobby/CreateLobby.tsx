import {useNavigate} from "react-router-dom";
import config from "../config";

export default () => {
  const navigate = useNavigate();
  return (
    <div className={"CreateLobby"}>
      <div onClick={event => {
        fetch(`${config.api}/gateway/create`, {method: "POST"})
          .then(value => value.json())
          .then(value => {
            console.log(value)
            navigate("../" + value.id);
          });
      }}>
        CREATE
      </div>
    </div>
  );
}
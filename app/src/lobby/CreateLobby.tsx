import {useNavigate} from "react-router-dom";

export default () => {
  const navigate = useNavigate();
  return (
    <div className={"CreateLobby"}>
      <div onClick={event => {
        fetch("http://localhost:5000/gateway/create", {method: "POST"})
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
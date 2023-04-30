import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {MdOutlineDangerous, MdPublic} from "react-icons/md";
import {LobbyItem} from "@board-games/core";
import "./Overview.scss";

export default () => {
  const reloadTime = 3;
  const [reload, setReload] = useState(0);
  const [lobbies, setLobbies] = useState<LobbyItem[]>();

  useEffect(() => {
    const id = setInterval(() => {
      if (reload > 0) {
        setReload(reload - 1);
      }
    }, 1000);
    return () => clearInterval(id);
  });
  useEffect(() => {
    if (reload === 0) {
      fetch("http://localhost:5000/lobbies")
        .then(value => value.json())
        .then(value => setLobbies(value))
        .then(value => setReload(reloadTime));
    }
  }, [reload]);

  return (
    <div className={"Overview"}>
      <Category title={"Games"}>
        <GameCard/>
      </Category>
      <Category title={"Lobbies"} info={<div className={"Time"}>{reload}s</div>}>
        {lobbies && lobbies.length ? lobbies.map(lobby => <LobbyCard key={lobby.id} lobby={lobby}/>) : <div className={"Empty"}><MdOutlineDangerous/><p></p></div>}
      </Category>
    </div>
  );
}

const Category = ({title, info, children}: { title: string, info?: React.ReactNode, children: React.ReactNode }) => {
  return (
    <div className={"Category"}>
      <div className={"Title"}>
        <div className={"Left"}>{title}</div>
        <div className={"Right"}>
          {info}
          {/*<MdKeyboardArrowDown/>*/}
        </div>
      </div>
      <div className={"Cards"}>
        {children}
      </div>
    </div>
  );
};
const GameCard = () => {
  return (
    <div className={"GameCard"}>

    </div>
  );
};
const LobbyCard = ({lobby}: { lobby: LobbyItem }) => {
  return (
    <Link to={`/${lobby.id}`} className={"LobbyCard"}>
      <MdPublic/>
      {/*<MdLock/>*/}
      <div className={"Name"}>{lobby.name}</div>
    </Link>
  );
};
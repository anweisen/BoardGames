import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {MdOutlineDangerous, MdPeople, MdPublic} from "react-icons/md";
import {LobbyInfo} from "@board-games/core";
import {ReactComponent as SvgUno} from "../icons/uno/icon-uno.svg";
import config from "../config";
import "./Overview.scss";

export default () => {
  const reloadTime = 3;
  const [reload, setReload] = useState(0);
  const [lobbies, setLobbies] = useState<LobbyInfo[]>();

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
      fetch(`${config.api}/lobbies`, {method: "GET", headers: {"Content-Type": "application/json"}})
        .then(value => value.json())
        .then(value => setLobbies(value))
        .then(_ => setReload(reloadTime));
    }
  }, [reload]);

  return (
    <div className={"Overview"}>
      <Category title={"Games"} count={1}>
        <GameCard name={"uno"} Svg={SvgUno} color={"uno-red"}/>
      </Category>
      <Category title={"Lobbies"} info={<div className={"Time"}>{reload}</div>} count={lobbies?.length || 0}>
        {lobbies && lobbies.length ? lobbies.map(lobby => <LobbyCard key={lobby.id} lobby={lobby}/>) :
          <div className={"Empty"}>
            <MdOutlineDangerous/>
            <span>
              <p>There are no waiting Lobbies</p>
              <p>Why dont you create a <Link to={"/new"}>new Lobby</Link>?</p>
            </span>
          </div>}
      </Category>
    </div>
  );
}

const Category = ({title, info, children, count}: { title: string, info?: React.ReactNode, children: React.ReactNode, count: number }) => {
  return (
    <div className={"Category " + title}>
      <div className={"Title"}>
        <div className={"Left"}>{title} <p>{count}</p></div>
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
const GameCard = ({name, color, Svg}: { name: string, color: string, Svg: React.FunctionComponent }) => {
  return (
    <Link className={"GameCard"} to={`/new/${name}`} style={{background: `var(--${color})`}}>
      {<Svg/>}
    </Link>
  );
};
const LobbyCard = ({lobby}: { lobby: LobbyInfo }) => {
  return (
    <Link to={`/${lobby.id}`} className={"LobbyCard"}>
      <MdPublic/>
      {/*<MdLock/>*/}
      <div className={"Name"}>{lobby.name}</div>
      <div className={"Players"}>
        <MdPeople/>
        <div>{lobby.players}</div>
      </div>
    </Link>
  );
};
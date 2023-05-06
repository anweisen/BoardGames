import {ReactComponent as UnoCard} from "../../../icons/uno/card-uno.svg";
import {MdOutlineAccountCircle, MdPeople} from "react-icons/md";
import "./UnoPlayerDisplay.scss";

export const UnoPlayerDisplayCore = ({position, init, name, id, currentPlayer, cards}: {
  position: "Left" | "Right" | "Top",
  init: boolean,
  name: string,
  id: string,
  currentPlayer: string,
  cards: number
}) => {
  return (
    <div className={"UnoPlayerDisplay " + position + (id === currentPlayer ? " Current" : "")}>
      <div className={"Cards"}>
        {[...Array(cards).keys()].map((value, index) => <UnoCard key={index} className={"Card" + (init ? " Init" : "")}/>)}
      </div>
      <div className={"Info"}>
        <div className={"Image"}><MdOutlineAccountCircle/></div>
        <div className={"Title"}>
          {/*<div><MdContentCopy/>{cards}</div>*/}
          <div>{name}</div>
        </div>
      </div>
    </div>
  );
};
export const UnoPlayerDisplayWrapperTop = ({init, currentPlayer, players}: { init: boolean, currentPlayer: string, players: { name: string, id: string, cards: number }[] }) => {
  const offset = players.findIndex(player => player.id === currentPlayer);
  const naturalOffset = offset === -1 ? 0 : offset;

  return (
    <div className={"UnoPlayerDisplayWrapper Top"}>
      {(players.length > naturalOffset + 1) && <div className={"Players After"}><MdPeople/><p>+{players.length - (naturalOffset + 1)}</p></div>}
      {[players[naturalOffset]].map(value => <UnoPlayerDisplayCore key={value.id} position={"Top"} init={init} currentPlayer={currentPlayer} id={value.id} name={value.name} cards={value.cards}/>)}
      {(offset > 0) && <div className={"Players Before"}><MdPeople/><p>+{offset}</p></div>}
    </div>
  );
};
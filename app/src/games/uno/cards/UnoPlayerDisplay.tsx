import {ReactComponent as UnoCard} from "../../../icons/uno/card-uno.svg";
import "./UnoPlayerDisplay.scss";

export const UnoPlayerDisplayCore = ({position, init, cards}: { position: "Left" | "Right" | "Top", init: boolean, cards: number }) => {
  return (
    <div className={"UnoPlayerDisplay " + position}>
      {[...Array(cards).keys()].map((value, index) => <UnoCard key={index} className={"Card" + (init ? " Init" : "")}/>)}
    </div>
  );
};
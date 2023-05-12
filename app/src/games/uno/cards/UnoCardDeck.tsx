import {ReactComponent as CardSvg} from "../../../icons/uno/card-uno.svg";
import "./UnoCardDeck.scss";

export default ({drawCard, highlight}: { drawCard: () => void, highlight: boolean }) => {
  return (
    <div className={"UnoCardDeck" + (highlight ? " Highlight" : "")} onClick={drawCard}>
      <CardSvg className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
    </div>
  );
}
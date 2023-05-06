import {ReactComponent as CardSvg} from "../../../icons/uno/card-uno.svg";
import "./UnoCardDeck.scss";

export default ({drawCard}: { drawCard: () => void }) => {
  return (
    <div className={"UnoCardDeck"} onClick={drawCard}>
      <CardSvg className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
    </div>
  );
}
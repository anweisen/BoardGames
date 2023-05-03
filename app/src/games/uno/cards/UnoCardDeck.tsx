import {UnoCardItem} from "@board-games/core";
import {UnoCardCore} from "./UnoCard";
import "./UnoCardDeck.scss";

export default ({cards, canUse, clicked, useCard, myTurn}: {
  cards: UnoCardItem[],
  canUse: (card: UnoCardItem) => boolean,
  clicked: number | undefined,
  useCard: (index: number) => void,
  myTurn: boolean,
}) => {
  return (
    <div className={"UnoCardDeck" + (!myTurn ? " Waiting" : "")}>
      {cards.map((card, index) => (
        <div key={index} className={"UnoCard" + (index === clicked ? " Fade" : "") + (!canUse(card) ? " Locked" : "")} onClick={canUse(card) ? () => useCard(index) : undefined}>
          <UnoCardCore type={card.type} color={card.color}/>
        </div>))}
    </div>
  );
}

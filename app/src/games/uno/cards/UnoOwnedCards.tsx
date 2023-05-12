import {UnoCardItem} from "@board-games/core";
import {UnoCardCore} from "./UnoCard";
import "./UnoOwnedCards.scss";

export default ({cards, canUse, clicked, drawn, useCard, myTurn}: {
  cards: UnoCardItem[],
  canUse: (card: UnoCardItem) => boolean,
  clicked: number | undefined,
  drawn: number | undefined,
  useCard: (index: number) => void,
  myTurn: boolean,
}) => {
  return (
    // @ts-ignore
    <div className={"UnoOwnedCards" + (myTurn ? " Current" : "")} style={{"--drawn": drawn}}>
      {cards.map((card, index, array) => (
        <div key={index + "-" + card.type + "-" + card.color}
             className={"UnoCard" + (index === clicked ? " Fade" : "") + (drawn && index >= (array.length - drawn) ? " Drawn" : "") + (canUse(card) ? " Usable" : "")}
             onClick={canUse(card) ? () => useCard(index) : undefined}>
          <UnoCardCore type={card.type} color={card.color}/>
        </div>))}
    </div>
  );
}

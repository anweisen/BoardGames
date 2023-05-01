import {UnoCardItem} from "@board-games/core";
import {UnoCardCore} from "./UnoCard";
import {useState} from "react";
import "./UnoCardDeck.scss";

export default ({cards, topCard, sendUseCardPacket}: { cards: UnoCardItem[], topCard: UnoCardItem, sendUseCardPacket: (index: number) => void }) => {
  const [clicked, setClicked] = useState<number>();
  return (
    <div className={"UnoCardDeck"}>
      {cards.map((card, index) => (
        <div className={"UnoCard" + (clicked === index ? " Fade" : "")} onClick={() => sendUseCardPacket(index)}>
          <UnoCardCore type={card.type} color={card.color}/>
        </div>))}
    </div>
  );
}

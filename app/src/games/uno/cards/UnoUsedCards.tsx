import {UnoCardItem} from "@board-games/core";
import UnoCard from "./UnoCard";

export default ({cards}: { cards: UnoCardItem[] }) => {
  return (
    <div className={"UnoUsedCards"}>
      {cards.map((card, index) => (
        <UnoCard key={index} card={card}/>
      ))}
    </div>
  );
}
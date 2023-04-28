import "./UnoCardDeck.scss"
import UnoCard from "./UnoCard";
import {UnoCardItem} from "../../../api/models";

export default ({cards, useCard}: { cards: UnoCardItem[], useCard: (index: number) => void }) => {
  return (
    <div className={"UnoCardDeck"}>
      {cards.map((card, index) => (
        <UnoCard key={index} card={card} handleClick={() => useCard(index)}/>
      ))}
    </div>
  )
}
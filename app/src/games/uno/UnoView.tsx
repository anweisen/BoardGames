import {useState} from "react";
import UnoCardDeck from "./cards/UnoCardDeck";
import UnoUsedCards from "./cards/UnoUsedCards";
import {UnoCardItem, UnoCardType, UnoColorType} from "../../api/models";
import "./UnoView.scss";

export default () => {
  const card: UnoCardItem = {color: UnoColorType.BLUE, type: UnoCardType.SKIP}

  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([card, card, card, card, card]);

  const useCard = (index: number) => {
    const card = ownedCards[index]

    setOwnedCards(ownedCards.splice(index, 1))

    usedCards.push(card)
    setUsedCards(usedCards)
  }
//penis (ich liebe dich)
  return (
    <div className={"UnoView"}>
      <UnoUsedCards cards={usedCards}/>
      <UnoCardDeck cards={ownedCards} useCard={useCard}/>
    </div>
  );
}
import {UnoCardItem, UnoCardType} from "@board-games/core";
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
    <div className={"UnoOwnedCards" + (myTurn ? " Current" : "") + (cards.length >= 30 ? " Miniature" : cards.length >= 20 ? " Tiny" : cards.length >= 15 ? " Small" : "")} style={{"--drawn": drawn}}>
      {cards.map((card, index) => ({...card, index: index}))
        .sort((a, b) => a.color - b.color || a.type - b.type)
        .reduce<EditedItem[]>(reduceDuplicates, [])
        .map((card, index, array) => (
          <div key={`${index}-${card.index}-${card.color}-${card.type}`}
               className={"UnoCard" + (card.index === clicked ? " Fade" : "") + (drawn && card.index >= (array.length - drawn) ? " Drawn Drawn" + (array.length + drawn - 1 - card.index) : "") + (canUse(card) ? " Usable" : "")}
               onClick={canUse(card) ? () => useCard(card.index) : undefined}>
            {[...Array((card.duplicate || 0) + 1)].map((_, duplicateIndex) => <UnoCardCore key={duplicateIndex} type={card.type} color={card.color}/>)}
          </div>))}
    </div>
  );
}

type EditedItem = UnoCardItem & { index: number, duplicate?: number }

const reduceDuplicates = (previousValue: EditedItem[], currentValue: EditedItem, currentIndex: number, array: EditedItem[]): EditedItem[] => {
  const existingIndex = previousValue.findIndex(value => value.color === currentValue.color && value.type === currentValue.type);
  if (existingIndex !== -1 && currentValue.type <= UnoCardType.N_9) {
    previousValue[existingIndex] = {...currentValue, duplicate: (previousValue[existingIndex]?.duplicate || 0) + 1};
  } else {
    previousValue.push(currentValue);
  }

  return previousValue;
};
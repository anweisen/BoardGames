import {useEffect, useState} from "react";
import {UnoCardItem, UnoCardType, UnoColorType} from "@board-games/core";
import UnoCardDeck from "./cards/UnoCardDeck";
import "./UnoView.scss";

export default () => {
  const card: UnoCardItem = {color: UnoColorType.BLUE, type: UnoCardType.SKIP};

  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([card, card, card, card, card]);
  const [ws, setWs] = useState<WebSocket>()

  const useCard = (index: number) => {
  };

  return (
    <div className={"UnoView"}>
      {/*<UnoUsedCards cards={usedCards}/>*/}
      <UnoCardDeck cards={ownedCards} useCard={useCard}/>
      {ws?.readyState}
    </div>
  );
}
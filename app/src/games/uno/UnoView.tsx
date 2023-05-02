import {MutableRefObject, useState} from "react";
import {canUseCard, InitUnoPayload, SocketMessageType, UnoCardItem} from "@board-games/core";
import UnoCardDeck from "./cards/UnoCardDeck";
import UnoUsedCards from "./cards/UnoUsedCards";
import {Connection, SocketHandlers} from "../../App";
import "./UnoView.scss";

export default ({connection, handler}: { connection: MutableRefObject<Connection>, handler: MutableRefObject<SocketHandlers> }) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);
  const [clickedCard, setClickedCard] = useState<{ time: number, index: number }>();

  handler.current[SocketMessageType.INIT_GAME] = (type, data: InitUnoPayload) => {
    setOwnedCards(data.cards);
    setUsedCards([data.topCard]);
  };
  handler.current[SocketMessageType.UNO_CONFIRM] = (type, data: { cards: UnoCardItem[] }) => {
    console.log("confirm", clickedCard);

    const age = Date.now() - clickedCard!!.time;
    setTimeout(() => {
      setClickedCard(undefined);
      setOwnedCards(data.cards);
    }, Math.max(450 - age, 0));
  };
  handler.current[SocketMessageType.UNO_REFUSE] = (type, data: { card: UnoCardItem }) => {
    setClickedCard(undefined);
  };

  const useCard = (index: number) => {
    console.log("use", clickedCard);
    if (clickedCard !== undefined) return;
    setClickedCard({time: Date.now(), index: index});
    connection.current.sendPacket(SocketMessageType.UNO_USE, {cardIndex: index});
  };
  const canUse = (card: UnoCardItem) => {
    const top = usedCards[0];
    return canUseCard(top.color, top.type, card);
  }

  return (
    <div className={"UnoView"}>
      <UnoUsedCards cards={usedCards}/>
      <UnoCardDeck cards={ownedCards} canUse={canUse} clicked={clickedCard?.index} useCard={useCard}/>
    </div>
  );
};
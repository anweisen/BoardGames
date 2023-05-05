import {MutableRefObject, useState} from "react";
import {canUseCard, InitUnoPayload, SocketMessageType, UnoCardItem} from "@board-games/core";
import UnoCardDeck from "./cards/UnoOwnedCards";
import UnoUsedCards from "./cards/UnoUsedCards";
import {Connection, SocketHandlers} from "../../App";
import "./UnoView.scss";

export default ({connection, handler}: { connection: MutableRefObject<Connection>, handler: MutableRefObject<SocketHandlers> }) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);
  const [clickedCard, setClickedCard] = useState<{ time: number, index: number, card: UnoCardItem }>();

  handler.current[SocketMessageType.INIT_GAME] = (type, data: InitUnoPayload) => {
    setOwnedCards(data.cards);
    setUsedCards([data.topCard]);
  };
  handler.current[SocketMessageType.UNO_USE] = (type, data: { player: string, card: UnoCardItem, cards: number }) => {
    setUsedCards(prev => [data.card, ...prev]);
  };
  handler.current[SocketMessageType.UNO_CONFIRM] = (type, data: { cards: UnoCardItem[] }) => {
    const age = Date.now() - clickedCard!!.time;

    setTimeout(() => {
      setUsedCards(prev => [...prev, clickedCard!!.card]);
    }, Math.max(250 - age, 0));
    setTimeout(() => {
      setOwnedCards(data.cards);
      setClickedCard(undefined);
    }, Math.max(500 - age, 0));
  };
  handler.current[SocketMessageType.UNO_REFUSE] = (type, data: { card: UnoCardItem }) => {
    setClickedCard(undefined);
  };

  const useCard = (index: number) => {
    if (clickedCard !== undefined) return;
    setClickedCard({time: Date.now(), index: index, card: ownedCards[index]});
    connection.current.sendPacket(SocketMessageType.UNO_USE, {cardIndex: index});
  };
  const canUse = (card: UnoCardItem) => {
    const top = usedCards[usedCards.length - 1];
    return canUseCard(top.color, top.type, card);
  };

  return (
    <div className={"UnoView"}>
      <UnoUsedCards cards={usedCards}/>
      <UnoCardDeck cards={ownedCards} canUse={canUse} clicked={clickedCard?.index} useCard={useCard} myTurn={true}/>
    </div>
  );
};
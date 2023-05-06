import {MutableRefObject, useState} from "react";
import {canUseCard, InitUnoPayload, PlayerInfo, SocketMessageType, UnoCardItem} from "@board-games/core";
import UnoOwnedCards from "./cards/UnoOwnedCards";
import UnoUsedCards from "./cards/UnoUsedCards";
import UnoCardDeck from "./cards/UnoCardDeck";
import {UnoPlayerDisplayCore} from "./cards/UnoPlayerDisplay";
import {Connection, SocketHandlers} from "../../App";
import "./UnoView.scss";

export default ({connection, handler, players, selfId}: {
  connection: MutableRefObject<Connection>,
  handler: MutableRefObject<SocketHandlers>,
  players: PlayerInfo[],
  selfId: string
}) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);
  const [clickedCard, setClickedCard] = useState<{ time: number, index: number, card: UnoCardItem }>();
  const [order, setOrder] = useState<string[]>();
  const [othersCardAmount, setOthersCardAmount] = useState<Record<string, number>>();

  handler.current[SocketMessageType.INIT_GAME] = (type, data: InitUnoPayload) => {
    setOwnedCards(data.cards);
    setUsedCards([data.topCard]);
    setOrder(data.order);
    setOthersCardAmount(Object.fromEntries(data.order.filter(cur => cur != selfId).map(cur => [cur, data.cards.length])));
  };
  handler.current[SocketMessageType.UNO_USE] = (type, data: { player: string, card: UnoCardItem, cards: number }) => {
    setUsedCards(prev => [...prev.filter((cur, index) => index > prev.length - 5), data.card]);
    setOthersCardAmount(prev => ({...prev, [data.player]: prev!![data.player] - 1 }))
  };
  handler.current[SocketMessageType.UNO_CONFIRM] = (type, data: { cards: UnoCardItem[] }) => {
    const age = Date.now() - clickedCard!!.time;

    setTimeout(() => {
      setUsedCards(prev => [...prev.filter((cur, index) => index > prev.length - 5), clickedCard!!.card]);
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
      {!usedCards || !ownedCards || !order || !othersCardAmount ? <>INIT AWAITING!=!=!</> : <>
        {order.map(player => ({player: player, amount: othersCardAmount[player]}))
          .filter(({player, amount}) => player !== selfId && players.some(info => info.id === player))
          .map(({player, amount}) => (
            <UnoPlayerDisplayCore key={player} position={"Top"} init={usedCards.length <= 1} cards={amount}/>
          ))}
        <UnoCardDeck/>
        <UnoUsedCards cards={usedCards}/>
        <UnoOwnedCards cards={ownedCards} canUse={canUse} clicked={clickedCard?.index} useCard={useCard} myTurn={true}/>
      </>}
    </div>
  );
};
import {MutableRefObject, useCallback, useState} from "react";
import {canUseCard, PlayerInfo, SocketMessageType, UnoCardItem, UnoCardType, UnoEffectPayload, UnoInitPayload} from "@board-games/core";
import UnoOwnedCards from "./cards/UnoOwnedCards";
import UnoUsedCards from "./cards/UnoUsedCards";
import UnoCardDeck from "./cards/UnoCardDeck";
import {UnoPlayerDisplayCore, UnoPlayerDisplayWrapperTop} from "./cards/UnoPlayerDisplay";
import {Connection, SocketHandlers} from "../../App";
import "./UnoView.scss";
import LobbyLoading from "../../lobby/LobbyLoading";

export default ({connection, handler, players, selfId}: {
  connection: MutableRefObject<Connection>,
  handler: MutableRefObject<SocketHandlers>,
  players: PlayerInfo[],
  selfId: string
}) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);
  const [clickedCard, setClickedCard] = useState<{ time: number, index: number, card?: UnoCardItem }>();
  const [drawnCard, setDrawnCard] = useState<{ amount: number }>();
  const [order, setOrder] = useState<string[]>();
  const [othersCardAmount, setOthersCardAmount] = useState<Record<string, number>>();
  const [currentPlayer, setCurrentPlayer] = useState<string>();
  const [effectPayload, setEffectPayload] = useState<UnoEffectPayload>();
  const [drawCounter, setDrawCounter] = useState<number>();

  handler.current[SocketMessageType.INIT_GAME] = (type, data: UnoInitPayload) => {
    // window.document.body.requestFullscreen({navigationUI: "hide"});
    setOwnedCards(data.cards);
    setUsedCards([data.topCard]);
    setOrder(data.order);
    setCurrentPlayer(data.order[0]);
    setOthersCardAmount(Object.fromEntries(data.order.filter(cur => cur != selfId).map(cur => [cur, data.cards.length])));
  };
  handler.current[SocketMessageType.UNO_NEXT] = (type, data: { player: string }) => {
    setCurrentPlayer(data.player);
  };
  handler.current[SocketMessageType.UNO_USE] = (type, data: { player: string, card: UnoCardItem, cards: number }) => {
    setUsedCards(prev => [...prev.filter((cur, index) => index > prev.length - 5), data.card]);
    setOthersCardAmount(prev => ({...prev, [data.player]: prev!![data.player] - 1}));
  };
  handler.current[SocketMessageType.UNO_CONFIRM_DRAW] = (type, data: { cards: UnoCardItem[] }) => {
    setDrawCounter(undefined); // the amount of cards which have to be drawn next time, reset -> other than +2/+4 cards can be used
    setClickedCard(undefined); // reset clicked card to allow client to click new card
    setDrawnCard({amount: data.cards.length});
    setOwnedCards(prev => [...prev, ...data.cards]);
    setTimeout(() => {
      setDrawnCard(undefined);
    }, 1000);
  };
  handler.current[SocketMessageType.UNO_CONFIRM] = (type, data: { cards: UnoCardItem[] }) => {
    const age = Date.now() - clickedCard!!.time;

    setTimeout(() => {
      setUsedCards(prev => [...prev.filter((cur, index) => index > prev.length - 5), clickedCard!!.card!!]);
    }, Math.max(250 - age, 0));
    setTimeout(() => {
      setOwnedCards(data.cards);
      setClickedCard(undefined);
    }, Math.max(500 - age, 0));
  };
  handler.current[SocketMessageType.UNO_REFUSE] = (type, data: { card: UnoCardItem }) => {
    setClickedCard(undefined);
  };
  handler.current[SocketMessageType.UNO_DRAW] = (type, data: { player: string, amount: number }) => {
    setDrawCounter(undefined); // the amount of cards which have to be drawn next time, reset -> other than +2/+4 cards can be used
    setOthersCardAmount(prev => ({...prev, [data.player]: prev!![data.player] + data.amount}));
  };
  handler.current[SocketMessageType.UNO_EFFECT] = (type, data: UnoEffectPayload) => {
    if (data.drawCounter)
      setDrawCounter(data.drawCounter)

    setTimeout(() => {
      setEffectPayload(data);
      setTimeout(() => {
        setEffectPayload(undefined);
      }, 2500);
    }, 500);
  };

  const drawCard = () => {
    if (selfId !== currentPlayer) return;
    if (clickedCard !== undefined) return;
    if (drawnCard !== undefined) return;
    setClickedCard({time: Date.now(), index: -1, card: undefined});
    connection.current.sendPacket(SocketMessageType.UNO_DRAW, {});
  };
  const useCard = (index: number) => {
    if (selfId !== currentPlayer) return;
    if (clickedCard !== undefined) return;
    setClickedCard({time: Date.now(), index: index, card: ownedCards[index]});
    connection.current.sendPacket(SocketMessageType.UNO_USE, {cardIndex: index});
  };
  const canUse = useCallback((card: UnoCardItem) => {
    if (drawCounter) return card.type === UnoCardType.DRAW || card.type === UnoCardType.DRAW_PICK;
    const top = usedCards[usedCards.length - 1];
    return canUseCard(top.color, top.type, card);
  }, [drawCounter, usedCards]);

  return (
    <>
      {!usedCards || !ownedCards || !order || !othersCardAmount || !currentPlayer ? <LobbyLoading/> : <>
        <div className={"UnoView"}>
          <UnoPlayerDisplays init={usedCards.length <= 1} selfId={selfId} players={players} order={order} othersCardAmount={othersCardAmount} currentPlayer={currentPlayer}/>
          <span className={"PlayCards"}>
            <UnoUsedCards cards={usedCards}/>
            <UnoCardDeck drawCard={drawCard} highlight={!ownedCards.some(canUse)}/>
            {effectPayload?.drawCounter && <span className={"DrawCounter"}>+{effectPayload.drawCounter}</span>}
          </span>
          <UnoOwnedCards cards={ownedCards} canUse={canUse} clicked={clickedCard?.index} drawn={drawnCard?.amount} useCard={useCard} myTurn={selfId === currentPlayer}/>
        </div>
      </>}
    </>
  );
};

const UnoPlayerDisplays = ({init, selfId, currentPlayer, players, order, othersCardAmount}: {
  init: boolean,
  selfId: string,
  currentPlayer: string,
  players: PlayerInfo[],
  order: string[],
  othersCardAmount: Record<string, number>
}) => {
  // 1  ->        top
  // 2  -> right,      left
  // 3  -> right, top, left
  // 4+ -> right, wrap,left
  const selfOrderIndex = order.indexOf(selfId); // = number of players before self
  const shiftedOrder: string[] = [];
  for (let i = selfOrderIndex + 1; i < order.length; i++) {
    shiftedOrder.push(order[i]);
  }
  for (let i = 0; i < selfOrderIndex; i++) {
    shiftedOrder.push(order[i]);
  }

  const nameFinder = Object.fromEntries(players.map(value => [value.id, value.name]));
  return (
    <>
      {(shiftedOrder.length === 1) && <UnoPlayerDisplayCore currentPlayer={currentPlayer} position={"Top"} init={init} id={shiftedOrder[0]} name={nameFinder[shiftedOrder[0]]}
                                                       cards={othersCardAmount[shiftedOrder[0]]}/>}
      {(shiftedOrder.length >= 2) && <UnoPlayerDisplayCore currentPlayer={currentPlayer} position={"Right"} init={init} id={shiftedOrder[0]} name={nameFinder[shiftedOrder[0]]}
                                                      cards={othersCardAmount[shiftedOrder[0]]}/>}
      {(shiftedOrder.length >= 2) && <UnoPlayerDisplayCore currentPlayer={currentPlayer} position={"Left"} init={init} id={shiftedOrder[shiftedOrder.length - 1]}
                                                      name={nameFinder[shiftedOrder[shiftedOrder.length - 1]]}
                                                      cards={othersCardAmount[shiftedOrder[shiftedOrder.length - 1]]}/>}
      {(shiftedOrder.length >= 3) && <UnoPlayerDisplayWrapperTop currentPlayer={currentPlayer} init={init} players={shiftedOrder
        .filter((value, index, array) => index !== 0 && index !== (array.length - 1))
        .map(player => ({name: nameFinder[player], id: player, cards: othersCardAmount[player]}))
      }/>}
    </>
  );
};
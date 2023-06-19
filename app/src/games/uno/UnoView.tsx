import React, {MutableRefObject, useCallback, useEffect, useState} from "react";
import {
  canUseCard,
  PlayerInfo,
  SocketMessageType,
  UnoCardItem,
  UnoCardType,
  UnoColorType,
  UnoDirection,
  UnoEffectPayload,
  UnoInitPayload,
  UnoSettingDuplicates,
  UnoSettings
} from "@board-games/core";
import {FaCrown} from "react-icons/fa";
import UnoOwnedCards from "./cards/UnoOwnedCards";
import UnoUsedCards from "./cards/UnoUsedCards";
import UnoCardDeck from "./cards/UnoCardDeck";
import {UnoPlayerDisplayCore, UnoPlayerDisplayWrapperTop} from "./cards/UnoPlayerDisplay";
import LobbyLoading from "../../lobby/LobbyLoading";
import {Connection, SocketHandlers} from "../../App";
import {ReactComponent as SvgUno} from "../../icons/uno/icon-uno.svg";
import "./UnoView.scss";

export default ({connection, handler, settings, players, selfId, playerName, setInLobby}: {
  connection: MutableRefObject<Connection>,
  handler: MutableRefObject<SocketHandlers>,
  settings: UnoSettings,
  players: PlayerInfo[],
  selfId: string,
  playerName: string | undefined,
  setInLobby: (state: boolean) => void
}) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [usedCardsCounter, setUsedCardsCounter] = useState(0);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);
  const [clickedCard, setClickedCard] = useState<{ time: number, index: number, card?: UnoCardItem }>();
  const [drawnCard, setDrawnCard] = useState<{ amount: number }>();
  const [drawingCard, setDrawingCard] = useState(false);
  const [order, setOrder] = useState<string[]>();
  const [othersCardAmount, setOthersCardAmount] = useState<Record<string, number>>();
  const [direction, setDirection] = useState<UnoDirection>();
  const [currentPlayer, setCurrentPlayer] = useState<string>();
  const [effectPayload, setEffectPayload] = useState<UnoEffectPayload>();
  const [drawCounter, setDrawCounter] = useState<number>();
  const [pickingColor, setPickingColor] = useState(false);
  const [won, setWon] = useState<string[]>();
  const [justWon, setJustWon] = useState<{ player: string, place: number }>();
  const [announcedUno, setAnnouncedUno] = useState(false);

  handler.current[SocketMessageType.INIT_GAME] = (type, data: UnoInitPayload) => {
    console.log("Initializing UNO..");
    setOwnedCards(data.cards);
    setUsedCards([data.topCard]);
    setOrder(data.order);
    setCurrentPlayer(data.order[0]);
    setOthersCardAmount(Object.fromEntries(data.order.filter(cur => cur != selfId).map(cur => [cur, data.cards.length])));
    setDirection(data.direction);
    console.log("Initialized UNO!");
  };
  handler.current[SocketMessageType.UNO_NEXT] = (type, data: { player: string }) => {
    setCurrentPlayer(data.player);
  };
  handler.current[SocketMessageType.UNO_USE] = (type, data: { player: string, usedCard: UnoCardItem, usedAmount: number, left: number }) => {
    setOthersCardAmount(prev => ({...prev, [data.player]: data.left}));
    for (let i = 0; i < data.usedAmount; i++) {
      setTimeout(() => {
        setUsedCards(prev => [...prev.filter((cur, index) => index > prev.length - 5), data.usedCard]);
        setUsedCardsCounter(prev => prev + 1);
      }, i * 250);
    }
  };
  handler.current[SocketMessageType.UNO_CONFIRM_DRAW] = (type, data: { cards: UnoCardItem[] }) => {
    setDrawCounter(undefined); // the amount of cards which have to be drawn next time, reset -> other than +2/+4 cards can be used
    setDrawnCard({amount: data.cards.length});
    setDrawingCard(false);
    setOwnedCards(prev => [...prev, ...data.cards]);
    setTimeout(() => {
      setDrawnCard(undefined);
    }, 1000);
  };
  handler.current[SocketMessageType.UNO_CONFIRM] = (type, data: { cards: UnoCardItem[], card: UnoCardItem, amount: number }) => {
    const age = Date.now() - clickedCard!!.time;

    setTimeout(() => {
      for (let i = 0; i < data.amount; i++) {
        setTimeout(() => {
          setUsedCards(prev => [...prev.filter((cur, index) => index > prev.length - 5), clickedCard!!.card!!]);
          setUsedCardsCounter(prev => prev + 1);
        }, i * 250);
      }

    }, Math.max(250 - age, 0));
    setTimeout(() => {
      setOwnedCards(data.cards);
      setClickedCard(undefined);

      if (data.card.type === UnoCardType.PICK_DRAW_4 || data.card.type === UnoCardType.PICK)
        setPickingColor(true);
    }, Math.max(500 - age, 0));
  };
  handler.current[SocketMessageType.UNO_REFUSE] = (type, data: { card?: UnoCardItem }) => {
    setClickedCard(undefined);
  };
  handler.current[SocketMessageType.UNO_DRAW] = (type, data: { player: string, amount: number }) => {
    setDrawCounter(undefined); // the amount of cards which have to be drawn next time, reset -> other than +2/+4 cards can be used
    setOthersCardAmount(prev => ({...prev, [data.player]: prev!![data.player] + data.amount}));
  };
  handler.current[SocketMessageType.UNO_PICK] = (type, data: { color: UnoColorType }) => {
    setUsedCards(prev => [...prev.splice(0, prev.length - 1), {color: prev[prev.length - 1].color, type: prev[prev.length - 1].type, picked: data.color}]);

    setTimeout(() => {
      setPickingColor(false);
    }, 500);
  };
  handler.current[SocketMessageType.UNO_EFFECT] = (type, data: UnoEffectPayload) => {
    if (data.drawCounter !== undefined) setDrawCounter(data.drawCounter);
    if (data.changeDirection !== undefined) setDirection(data.changeDirection);

    setTimeout(() => {
      setEffectPayload(data);
      setTimeout(() => {
        setEffectPayload(undefined);
      }, 4000);
    }, 250);
  };
  handler.current[SocketMessageType.UNO_WIN] = (type, data: { player: string, end: boolean, placement: string[] }) => {
    if (data.end) {
      setWon(data.placement);
    } else {
      setJustWon({player: data.player, place: data.placement?.length});
      setTimeout(() => setJustWon(undefined), 7000);
    }
  };

  const drawCard = () => {
    if (selfId !== currentPlayer) return;
    if (clickedCard !== undefined) return;
    if (drawnCard !== undefined) return;
    if (drawingCard) return;
    if (pickingColor) return;
    setDrawingCard(true);
    connection.current.sendPacket(SocketMessageType.UNO_DRAW, {});
  };
  const useCard = (index: number) => {
    if (selfId !== currentPlayer) return;
    if (clickedCard !== undefined) return;
    if (drawingCard) return;
    setClickedCard({time: Date.now(), index: index, card: ownedCards[index]});
    connection.current.sendPacket(SocketMessageType.UNO_USE, {cardIndex: index});
  };
  const pickColor = (color: UnoColorType) => {
    connection.current.sendPacket(SocketMessageType.UNO_PICK, {color: color});
  };
  const announceUno = () => {
    if (announcedUno) return;
    connection.current.sendPacket(SocketMessageType.UNO_UNO, {});
    setAnnouncedUno(true);
  };
  const canUse = useCallback((card: UnoCardItem) => {
    const top = usedCards[usedCards.length - 1];
    return canUseCard(settings, top.picked || top.color, top.type, drawCounter, card);
  }, [drawCounter, usedCards]);

  return (
    <>
      {!usedCards || !ownedCards || !order || !othersCardAmount || !currentPlayer || direction === undefined ? <LobbyLoading/> : <>
        <div className={"UnoView"}>
          <UnoPlayerDisplays init={usedCards.length <= 1} selfId={selfId} players={players} order={order} othersCardAmount={othersCardAmount} currentPlayer={currentPlayer}/>
          <span className={"PlayCards"}>
            <DirectionArrows direction={direction}/>
            <UnoUsedCards cards={usedCards} usedCardsCounter={usedCardsCounter}/>
            <UnoCardDeck drawCard={drawCard} highlight={selfId === currentPlayer && !ownedCards.some(canUse) && !pickingColor}/>

            {effectPayload?.unoPlayer && <UnoDisplay player={effectPayload?.unoPlayer} players={players} playerName={playerName!!} selfId={selfId}/>}
            {effectPayload?.drawCounter && <span className={"DrawCounter"}>+{effectPayload.drawCounter}</span>}
            {pickingColor && <PickColor pickColor={pickColor}/>}
            {justWon && <UnoDisplay place={justWon.place} player={justWon.player} players={players} playerName={playerName!!} selfId={selfId}/>}
          </span>
          <div className={"UnoHand"}>
            <UnoOwnedCards cards={ownedCards} canUse={canUse} clicked={clickedCard?.index} drawn={drawnCard?.amount} settings={settings} useCard={useCard}
                           myTurn={selfId === currentPlayer && !pickingColor}/>
            {ownedCards.length <= 4 && <UnoButton usable={selfId === currentPlayer && !pickingColor && ownedCards.length - countDuplicates(ownedCards, settings) === 2 && !announcedUno} click={announceUno}/>}
          </div>
        </div>
        {won && <WinScreen placement={won!!} names={createNameFinder(selfId, playerName!!, players)} toLobby={() => setInLobby(true)}/>}
      </>}
    </>
  );
};

const countDuplicates = (cards: UnoCardItem[], settings: UnoSettings) => {
  if (settings.duplicates !== UnoSettingDuplicates.ON) return 0;
  let duplicates = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].type > UnoCardType.N_9) continue;

    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i] === cards[j]) {
        duplicates++;
        break;
      }
    }
  }
  return duplicates;
};

const UnoDisplay = ({place, player, selfId, playerName, players}: { place?: number, player: string, playerName: string, selfId: string, players: PlayerInfo[] }) => (
  <div className={"Uno"}>
    <div><SvgUno/>{place && <SvgUno/>}</div>
    <span>
      {place && <div className={"Place _" + place}>{place}</div>}
      <div className={"Name"}>{createNameFinder(selfId, playerName!!, players)[player]}</div>
    </span>
  </div>
);

const UnoButton = ({usable, click}: { usable: boolean, click: () => void }) => (
  <div className={"UnoButton" + (usable ? " Usable" : "")} onClick={usable ? click : undefined}>
    <SvgUno/>
  </div>
);

const DirectionArrows = ({direction}: { direction: UnoDirection }) => {
  return (
    <div className={"DirectionArrows " + (direction === UnoDirection.CLOCKWISE ? "Clockwise" : "CounterClockwise")}>
      <div className={"Left"}>
        {direction === UnoDirection.CLOCKWISE ?
          <svg viewBox="254.007 93.631 44.657 164.115" width="44.657" height="164.115">
            <path fill="currentColor"
                  d="M 281.456 93.631 C 290.822 105.22 316.155 167.248 279.22 236.771 L 293.329 243.1 L 259.104 257.746 L 254.007 226.484 L 267.709 232.78 C 292.687 191.682 293.579 138.075 273.366 102.039 L 281.456 93.631 Z"
                  transform="matrix(-1, 0, 0, -1, 552.670532, 351.377014)"></path>
          </svg> :
          <svg viewBox="254.007 93.631 44.657 164.115" width="44.657" height="164.115">
            <path fill="currentColor"
                  d="M 281.456 257.746 C 290.822 246.157 316.155 184.129 279.22 114.606 L 293.329 108.277 L 259.104 93.631 L 254.007 124.893 L 267.709 118.597 C 292.687 159.695 293.579 213.302 273.366 249.338 L 281.456 257.746 Z"
                  transform="matrix(-1, 0, 0, -1, 552.670532, 351.377014)"></path>
          </svg>}
      </div>
      <div className={"Right"}>
        {direction === UnoDirection.CLOCKWISE ?
          <svg viewBox="254.007 93.631 44.657 164.115" width="44.657" height="164.115">
            <path fill="currentColor"
                  d="M 281.456 93.631 C 290.822 105.22 316.155 167.248 279.22 236.771 L 293.329 243.1 L 259.104 257.746 L 254.007 226.484 L 267.709 232.78 C 292.687 191.682 293.579 138.075 273.366 102.039 L 281.456 93.631 Z"></path>
          </svg> :
          <svg viewBox="254.007 93.631 44.657 164.115" width="44.657" height="164.115">
            <path fill="currentColor"
                  d="M 281.456 257.746 C 290.822 246.157 316.155 184.129 279.22 114.606 L 293.329 108.277 L 259.104 93.631 L 254.007 124.893 L 267.709 118.597 C 292.687 159.695 293.579 213.302 273.366 249.338 L 281.456 257.746 Z"></path>
          </svg>}
      </div>
    </div>
  );
};

const WinScreen = ({placement, names, toLobby}: { placement: string[], names: Record<string, string>, toLobby: () => void }) => {
  const [timer, setTimer] = useState(15);

  useEffect(() => {
    if (timer === 0) {
      return toLobby();
    }

    const id = setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timer]);

  return (
    <span className={"UnoWinner"}>
      <FaCrown/>
      <div className={"Placement"}>
        {placement.map((playerId, index) => <div key={index} className={"Place _" + (index + 1)}>
          <div className={"Number"}>{index + 1}</div>
          <div className={"Name"}>{names[playerId]}</div>
        </div>)}
      </div>
      <div className={"Button"} onClick={toLobby}>Ready {timer < 10 ? "0" + timer : timer}s</div>
    </span>
  );
};

const PickColor = ({pickColor}: { pickColor: (color: UnoColorType) => void }) => {
  const [clicked, setClicked] = useState<UnoColorType>();
  const handle = (color: UnoColorType) => {
    setClicked(color);
    pickColor(color);
  };

  return (
    <span className={"PickColor"}>
      <span className={(clicked !== undefined ? "Hide" : "")}>
        <div onClick={_ => handle(UnoColorType.GREEN)}/>
        <div onClick={_ => handle(UnoColorType.YELLOW)}/>
        <div onClick={_ => handle(UnoColorType.BLUE)}/>
        <div onClick={_ => handle(UnoColorType.RED)}/>
      </span>
    </span>
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
  // 1  ->       top
  // 2  -> left,      right
  // 3  -> left, top, right
  // 4+ -> left, wrap,right
  const selfOrderIndex = order.indexOf(selfId); // = number of players before self
  const shiftedOrder: string[] = [];
  for (let i = selfOrderIndex + 1; i < order.length; i++) {
    if (othersCardAmount[order[i]] === 0) continue;
    shiftedOrder.push(order[i]);
  }
  for (let i = 0; i < selfOrderIndex; i++) {
    if (othersCardAmount[order[i]] === 0) continue;
    shiftedOrder.push(order[i]);
  }

  const nameFinder = Object.fromEntries(players.map(value => [value.id, value.name]));
  return (
    <>
      {(shiftedOrder.length === 1) && <UnoPlayerDisplayCore currentPlayer={currentPlayer} position={"Top"} init={init} id={shiftedOrder[0]} name={nameFinder[shiftedOrder[0]]}
                                                            cards={othersCardAmount[shiftedOrder[0]]}/>}
      {(shiftedOrder.length >= 2) && <UnoPlayerDisplayCore currentPlayer={currentPlayer} position={"Right"} init={init} id={shiftedOrder[shiftedOrder.length - 1]}
                                                           name={nameFinder[shiftedOrder[shiftedOrder.length - 1]]}
                                                           cards={othersCardAmount[shiftedOrder[shiftedOrder.length - 1]]}/>}
      {(shiftedOrder.length >= 2) && <UnoPlayerDisplayCore currentPlayer={currentPlayer} position={"Left"} init={init} id={shiftedOrder[0]} name={nameFinder[shiftedOrder[0]]}
                                                           cards={othersCardAmount[shiftedOrder[0]]}/>}
      {(shiftedOrder.length >= 3) && <UnoPlayerDisplayWrapperTop currentPlayer={currentPlayer} init={init} players={shiftedOrder
        .filter((value, index, array) => index !== 0 && index !== (array.length - 1))
        .map(player => ({name: nameFinder[player], id: player, cards: othersCardAmount[player]}))
      }/>}
    </>
  );
};

const createNameFinder = (selfId: string, playerName: string, players: PlayerInfo[]) => {
  return {...Object.fromEntries(players.map(value => [value.id, value.name])), ...Object.fromEntries([[selfId, playerName!!]])};
};
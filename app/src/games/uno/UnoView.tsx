import {MutableRefObject, useState} from "react";
import {InitUnoPayload, SocketMessageType, UnoCardItem} from "@board-games/core";
import UnoCardDeck from "./cards/UnoCardDeck";
import UnoUsedCards from "./cards/UnoUsedCards";
import {Connection, SocketHandlers} from "../../App";
import "./UnoView.scss";

export default ({connection, handler}: { connection: MutableRefObject<Connection>, handler: MutableRefObject<SocketHandlers> }) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);
  const [clickedCard, setClickedCard]=useState<number>()

  handler.current[SocketMessageType.INIT_GAME] = (type, data: InitUnoPayload) => {
    setOwnedCards(data.cards);
    setUsedCards([data.topCard]);
  };
  handler.current[SocketMessageType.UNO_CONFIRM] = (type, data) => {
  }
  handler.current[SocketMessageType.UNO_REFUSE] = (type, data) => {

  }

  const sendUseCardPacket = (index: number) => {
    connection.current.sendPacket(SocketMessageType.UNO_USE, {cardIndex: index});
    setOwnedCards(prev => prev.filter((cur, i) => i !== index));
  };

  return (
    <div className={"UnoView"}>
      <UnoUsedCards cards={usedCards}/>
      <UnoCardDeck cards={ownedCards} topCard={usedCards[0]} sendUseCardPacket={sendUseCardPacket}/>
    </div>
  );
}
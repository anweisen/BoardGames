import {MutableRefObject, useState} from "react";
import {SocketMessageType, UnoCardItem, UnoCardType, UnoColorType} from "@board-games/core";
import UnoCardDeck from "./cards/UnoCardDeck";
import {Connection, SocketHandlers} from "../../App";
import "./UnoView.scss";

export default ({connection, handler}: { connection: MutableRefObject<Connection>, handler: MutableRefObject<SocketHandlers> }) => {
  const [usedCards, setUsedCards] = useState<UnoCardItem[]>([]);
  const [ownedCards, setOwnedCards] = useState<UnoCardItem[]>([]);

  handler.current[SocketMessageType.INIT_GAME] = (type, data: any) => {
    console.log("Hop");
  }
  console.log("!");

  const useCard = (index: number) => {
  };

  return (
    <div className={"UnoView"}>
      {/*<UnoUsedCards cards={usedCards}/>*/}
      <UnoCardDeck cards={ownedCards} useCard={useCard}/>
    </div>
  );
}
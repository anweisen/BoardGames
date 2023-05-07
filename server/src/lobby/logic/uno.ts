import * as ws from "ws";
import {canUseCard, SocketMessageType, UnoCardItem, UnoCardType, UnoColoredTypes, UnoColorType, UnoDirection} from "@board-games/core";
import {GameBase} from "./game";
import {Lobby, Participant, pickRandom, PlayerId, shuffle} from "../models";

const createAllCards = () => {
  const cards: UnoCardItem[] = [];
  for (let type of UnoColoredTypes) {
    for (let color: UnoColorType = 1; color <= 4; color++) {
      cards.push({type: type, color: color});
    }
  }
  // for (let i = 0; i < 4; i++) {
  //   for (let type of UnoSpecialTypes) {
  //     cards.push({type: type, color: UnoColorType.BLACK});
  //   }
  // }
  return cards;
};

export class UnoGame extends GameBase {
  static allCards = shuffle(createAllCards());
  private order: PlayerId[] = [];
  private cards: Map<PlayerId, UnoCardItem[]> = new Map();
  private direction: UnoDirection = UnoDirection.CLOCKWISE;
  private current: number = 0;
  private topCard?: UnoCardItem;
  private drawCounter?: number;

  constructor(getLobby: () => Lobby) {
    super(getLobby);
  }

  handleMessage(type: SocketMessageType, data: any, player: PlayerId): void {
    switch (type) {
      case SocketMessageType.REQUEST_START:
        if (this.ingame) return;

        this.ingame = true;
        this.broadcastPacket(SocketMessageType.PREPARE_START, {});

        shuffle(this.order);
        this.topCard = this.pickStartCard();
        this.distributeCards(7);

        setTimeout(() => {
          for (let [playerId, cards] of this.cards) {
            this.sendPacket(playerId, SocketMessageType.INIT_GAME, {
              direction: this.direction,
              order: this.order,
              topCard: this.topCard,
              cards: cards
            });
          }
        }, 25);
        break;
      case SocketMessageType.UNO_USE:
        if (!this.cards.has(player))
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});
        const cardIndex = data.cardIndex as number;
        const card = (this.cards.get(player) as UnoCardItem[])[cardIndex];

        if (player !== this.currentPlayer())
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {card: card});
        if (this.drawCounter) {
          if (this.topCard?.type === UnoCardType.DRAW_PICK && card.type != UnoCardType.DRAW_PICK) // TODO allow +2 of chosen color
            return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {card: card});

          if (this.topCard?.type == UnoCardType.DRAW && card.type !== UnoCardType.DRAW)
            return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {card: card});

        } else if (!canUseCard(this.topCard!!.color, this.topCard!!.type, card))
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {card: card});

        this.useCard(cardIndex, card, player);
        break;
      case SocketMessageType.UNO_DRAW:
        if (player !== this.currentPlayer())
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});

        if (this.drawCounter) {
          this.drawCardsWithPackets(player, this.drawCounter);
          this.drawCounter = 0;
        } else {
          this.drawCardsWithPackets(player, 1);
        }
        break;
    }
  }

  handleClose(playerId: PlayerId): void {
    this.order.splice(this.order.indexOf(playerId), 1);
    this.broadcastPacket(SocketMessageType.LEAVE, {id: playerId});
  }

  handleJoin(participant: Participant, socket: ws): void {
    this.order.push(participant.id);
    this.broadcastPacket(SocketMessageType.JOIN, {id: participant.id, name: participant.name}, participant.id);
  }

  useCard(cardIndex: number, card: UnoCardItem, player: PlayerId) {
    const cards = this.cards.get(player)!!;
    cards.splice(cardIndex, 1);
    this.topCard = card;

    this.broadcastPacket(SocketMessageType.UNO_USE, {player: player, card: card, cards: cards.length}, player);
    this.sendPacket(player, SocketMessageType.UNO_CONFIRM, {cards: cards});

    switch (card.type) {
      case UnoCardType.PICK:
      case UnoCardType.DRAW_PICK:
        return;

      case UnoCardType.REVERSE:
        this.direction = this.direction === 0 ? 1 : 0;
        if (this.cards.size === 2) {
          this.nextPlayerInDirection();
        }
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {changeDirection: this.direction});
        break;
      case UnoCardType.SKIP:
        const skipPlayer = this.nextPlayerInDirection();
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {skipPlayer: skipPlayer});
        break;
      case UnoCardType.DRAW: // +2
        if (!this.drawCounter) this.drawCounter = 0;
        this.drawCounter += 2;
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {drawCounter: this.drawCounter});
        break;
    }
    const nextPlayer = this.nextPlayerInDirection();
    this.broadcastPacket(SocketMessageType.UNO_NEXT, {player: nextPlayer});
  }

  distributeCards(amount: number) {
    for (let playerId of this.order) {
      const cards = [];
      for (let i = 0; i < amount; i++) {
        cards.push(pickRandom(UnoGame.allCards));
      }
      this.cards.set(playerId, cards);
    }
  }

  drawCardsWithPackets(player: PlayerId, amount: number) {
    const cards: UnoCardItem[] = [];
    for (let i = 0; i < amount; i++) {
      cards.push(pickRandom(UnoGame.allCards));
    }
    this.cards.set(player, [...this.cards.get(player)!!, ...cards]);
    this.sendPacket(player, SocketMessageType.UNO_CONFIRM_DRAW, {cards: cards});
    this.broadcastPacket(SocketMessageType.UNO_DRAW, {player: player, amount: amount}, player);
  }

  pickStartCard(): UnoCardItem {
    while (true) {
      const card = pickRandom(UnoGame.allCards);
      if (card.color !== UnoColorType.BLACK && card.type <= UnoCardType.N_9)
        return card;
    }
  }

  nextPlayerInDirection(): PlayerId {
    this.current++;
    if (this.current >= this.order.length) this.current = 0;
    return this.order[this.current];
  }

  currentPlayer(): PlayerId {
    return this.order[this.current];
  }

}

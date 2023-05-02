import * as ws from "ws";
import {
  canUseCard,
  SocketMessageType,
  UnoCardItem,
  UnoCardType,
  UnoColoredTypes,
  UnoColorType,
  UnoDirection,
  UnoSpecialTypes
} from "@board-games/core";
import {GameBase} from "./game";
import {Lobby, Participant, PlayerId} from "../models";

const createAllCards = () => {
  // every colored card x2 per color, every black card x4
  const cards: UnoCardItem[] = [];
  for (let i = 0; i < 2; i++) {
    for (let type of UnoColoredTypes) {
      for (let color: UnoColorType = 1; color < 4; color++) {
        cards.push({type: type, color: color});
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let type of UnoSpecialTypes) {
      cards.push({type: type, color: UnoColorType.BLACK});
    }
  }
  return cards;
};

export class UnoGame extends GameBase {
  static allCards = createAllCards();
  private order: PlayerId[] = [];
  private cards: Map<PlayerId, UnoCardItem[]> = new Map();
  private direction: UnoDirection = UnoDirection.CLOCKWISE;
  private current: number = 0;
  private topCard?: UnoCardItem;

  constructor(getLobby: () => Lobby) {
    super(getLobby);
  }

  handleMessage(type: SocketMessageType, data: any, player: PlayerId): void {
    switch (type) {
      case SocketMessageType.REQUEST_START:
        this.broadcastPacket(SocketMessageType.PREPARE_START, {});
        this.ingame = true;
        this.shuffle(this.order);
        this.distributeCards(7);
        this.topCard = this.pickStartCard();

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
        if (player !== this.currentPlayer())
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});
        if (!this.cards.has(player))
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});
        const cardIndex = data.cardIndex as number;
        const card = (this.cards.get(player) as UnoCardItem[])[cardIndex];

        if (!canUseCard(this.topCard!!.color, this.topCard!!.type, card))
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});

        this.useCard(card, player)
        break;
    }
  }

  handleClose(playerId: PlayerId): void {
    this.order.splice(this.order.indexOf(playerId));
    this.broadcastPacket(SocketMessageType.LEAVE, {id: playerId});
  }

  handleJoin(participant: Participant, socket: ws): void {
    this.order.push(participant.id);
    this.broadcastPacket(SocketMessageType.JOIN, {id: participant.id, name: participant.name}, participant.id);
  }

  useCard(card: UnoCardItem, player: PlayerId) {
    this.broadcastPacket(SocketMessageType.UNO_USE, {player: player, card: card}, player);
    this.sendPacket(player, SocketMessageType.UNO_CONFIRM, {card: card})

    switch (card.type) {
      case UnoCardType.PICK:
      case UnoCardType.DRAW_PICK:
        return;

      case UnoCardType.REVERSE:
        this.direction = this.direction === 0 ? 1 : 0;
        if (this.cards.size === 1) {
          this.nextPlayerInDirection()
        }
        break;
      case UnoCardType.SKIP:
        this.nextPlayerInDirection();
        break;
    }
    this.nextPlayerInDirection();
  }

  distributeCards(amount: number) {
    for (let playerId of this.order) {
      const cards = [];
      for (let i = 0; i < amount; i++) {
        cards.push(this.pickRandom(UnoGame.allCards));
      }
      this.cards.set(playerId, cards);
    }
  }


  pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  pickStartCard(): UnoCardItem {
    while (true) {
      const card = this.pickRandom(UnoGame.allCards);
      if (card.color !== UnoColorType.BLACK && card.type <= UnoCardType.N_9)
        return card;
    }
  }

  shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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

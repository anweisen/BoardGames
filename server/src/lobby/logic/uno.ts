import {canUseCard, SocketMessageType, UnoCardItem, UnoCardType, UnoColoredTypes, UnoColorType, UnoDirection, UnoSpecialTypes} from "@board-games/core";
import {GameBase} from "./game";
import {Lobby, Participant, ParticipantRole, pickRandom, PlayerId, shuffle} from "../models";
import {AssertionError} from "assert";

const createAllCards = () => {
  const cards: UnoCardItem[] = [];
  for (let type of UnoColoredTypes) {
    for (let color: UnoColorType = 1; color <= 4; color++) {
      cards.push({type: type, color: color});
    }
  }
  for (let i = 0; i < 2; i++) {
    for (let type of UnoSpecialTypes) {
      cards.push({type: type, color: UnoColorType.BLACK});
    }
  }
  return cards;
};

export class UnoGame extends GameBase {
  static allCards = shuffle(createAllCards());
  private order: PlayerId[] = [];
  private cards: Map<PlayerId, UnoCardItem[]> = new Map();
  private direction: UnoDirection = UnoDirection.CLOCKWISE;
  private current: number = 0;
  private topCard?: UnoCardItem;
  private pickedColor?: UnoColorType;
  private drawCounter: number = 0;

  constructor(getLobby: () => Lobby) {
    super(getLobby);
  }

  handleMessage(type: SocketMessageType, data: any, player: PlayerId): void {
    switch (type) {
      case SocketMessageType.REQUEST_START:
        if (this.ingame) return;
        if (this.order.length < 2) return;
        if (this.getLobby().participants[player].role != ParticipantRole.ADMIN) return;

        this.ingame = true;
        this.broadcastPacket(SocketMessageType.PREPARE_START, {});

        shuffle(this.order);
        this.topCard = this.pickStartCard();
        this.distributeCards(1);

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
        if (!this.canUseCardNow(card))
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
      case SocketMessageType.UNO_PICK:
        if (player !== this.currentPlayer())
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});

        this.pickedColor = data.color as UnoColorType;
        this.broadcastPacket(SocketMessageType.UNO_PICK, {player: player, color: this.pickedColor});
        return;
    }
  }

  handleClose(playerId: PlayerId): void {
    this.order.splice(this.order.indexOf(playerId), 1);
    this.broadcastPacket(SocketMessageType.LEAVE, {id: playerId});
  }

  handleJoin(participant: Participant): void {
    this.order.push(participant.id);
    this.broadcastPacket(SocketMessageType.JOIN, {id: participant.id, name: participant.name}, participant.id);
  }

  useCard(cardIndex: number, card: UnoCardItem, player: PlayerId) {
    const cards = this.cards.get(player)!!;
    cards.splice(cardIndex, 1);
    this.topCard = card;
    this.pickedColor = undefined;

    this.broadcastPacket(SocketMessageType.UNO_USE, {player: player, card: card, cards: cards.length}, player);
    this.sendPacket(player, SocketMessageType.UNO_CONFIRM, {cards: cards, card: card});

    if (cards.length === 0) {
      this.broadcastPacket(SocketMessageType.UNO_WIN, {player: player});
      this.ingame = false;
      return;
    }

    switch (card.type) {
      case UnoCardType.DRAW_PICK: // +4
        this.drawCounter += 4;
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {drawCounter: this.drawCounter});
      case UnoCardType.PICK:
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
        this.drawCounter += 2;
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {drawCounter: this.drawCounter});
        break;
    }

    const nextPlayer = this.nextPlayerInDirection();
    this.broadcastPacket(SocketMessageType.UNO_NEXT, {player: nextPlayer});
  }

  canUseCardNow(card: UnoCardItem): boolean {
    if (this.drawCounter) return (card.type === UnoCardType.DRAW_PICK || card.type === UnoCardType.DRAW && (this.pickedColor === undefined || this.pickedColor === card.color));
    return canUseCard(this.pickedColor || this.topCard!!.color, this.topCard!!.type, card);
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
    const totalCards = [...this.cards.get(player)!!, ...cards];
    this.cards.set(player, totalCards);
    this.sendPacket(player, SocketMessageType.UNO_CONFIRM_DRAW, {cards: cards});
    this.broadcastPacket(SocketMessageType.UNO_DRAW, {player: player, amount: amount}, player);

    if (!totalCards.some(card => this.canUseCardNow(card))) {
      const nextPlayer = this.nextPlayerInDirection();
      this.broadcastPacket(SocketMessageType.UNO_NEXT, {player: nextPlayer});
    }
  }

  pickStartCard(): UnoCardItem {
    for (let i = 0; i < 10; i++) {
      const card = pickRandom(UnoGame.allCards);
      if (card.color !== UnoColorType.BLACK && card.type <= UnoCardType.N_9)
        return card;
    }
    throw new AssertionError();
  }

  nextPlayerInDirection(): PlayerId {
    if (this.direction === UnoDirection.CLOCKWISE) this.current++;
    else this.current--;

    if (this.current >= this.order.length) this.current = 0;
    if (this.current < 0) this.current = this.order.length - 1;
    return this.order[this.current];
  }

  currentPlayer(): PlayerId {
    return this.order[this.current];
  }

}

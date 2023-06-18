import {
  canUseCard,
  SocketMessageType,
  UnoCardItem,
  UnoCardType,
  UnoColoredTypes,
  UnoColorType,
  UnoDirection,
  UnoSettingDuplicates,
  UnoSettings,
  UnoSettingStacking,
  UnoSpecialTypes
} from "@board-games/core";
import {AssertionError} from "assert";
import {Lobby, Participant, pickRandom, PlayerId, shuffle} from "../models";
import {GameBase} from "./game";

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
  static defaultSettings: UnoSettings = {cards: 7, stacking: UnoSettingStacking.SEPARATE, duplicates: UnoSettingDuplicates.ON};

  public settings: UnoSettings = UnoGame.defaultSettings;
  private order: PlayerId[] = [];
  private cards: Map<PlayerId, UnoCardItem[]> = new Map();
  private direction: UnoDirection = UnoDirection.CLOCKWISE;
  private current: number = 0;
  private topCard?: UnoCardItem;
  private pickedColor?: UnoColorType;
  private drawCounter: number = 0;
  private placement: PlayerId[] = [];

  constructor(getLobby: () => Lobby) {
    super(getLobby);
  }

  handleMessage(type: SocketMessageType, data: any, player: PlayerId): void {
    switch (type) {
      case SocketMessageType.UPDATE_SETTINGS:
        if (this.ingame) return;
        if (!this.hasPermissions(player)) return;

        const settings = data as UnoSettings;
        this.settings = settings;
        this.broadcastPacket(SocketMessageType.UPDATE_SETTINGS, settings);
        break;
      case SocketMessageType.REQUEST_START:
        if (this.ingame) return;
        if (!this.hasPermissions(player)) return;
        if (Object.values(this.getLobby().participants).length < 2) return;

        this.ingame = true;
        this.broadcastPacket(SocketMessageType.PRE_START, {});

        this.placement = [];
        this.order = [...Object.keys(this.getLobby().participants)];
        shuffle(this.order);

        this.topCard = this.pickStartCard();
        this.distributeCards(this.settings.cards);

        setTimeout(() => {
          for (let [playerId, cards] of this.cards) {
            this.sendPacket(playerId, SocketMessageType.INIT_GAME, {
              direction: this.direction,
              order: this.order,
              topCard: this.topCard,
              cards: cards
            });
          }
        }, 500);
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

        this.drawCardsWithPackets(player, this.drawCounter || 1);
        break;
      case SocketMessageType.UNO_PICK:
        if (player !== this.currentPlayer())
          return this.sendPacket(player, SocketMessageType.UNO_REFUSE, {});

        this.pickedColor = data.color as UnoColorType;
        this.broadcastPacket(SocketMessageType.UNO_PICK, {player: player, color: this.pickedColor});
        this.broadcastPacket(SocketMessageType.UNO_NEXT, {player: this.nextPlayerInDirection()});
        return;
    }
  }

  handleClose(playerId: PlayerId): void {
    //this.order.splice(this.order.indexOf(playerId), 1);
    this.cards.delete(playerId);
    this.broadcastPacket(SocketMessageType.LEAVE, {id: playerId});
  }

  handleJoin(participant: Participant): void {
    this.broadcastPacket(SocketMessageType.JOIN, {id: participant.id, name: participant.name}, participant.id);
  }

  useCard(cardIndex: number, card: UnoCardItem, player: PlayerId) {
    const cards = this.cards.get(player)!!;
    cards.splice(cardIndex, 1);
    this.topCard = card;
    this.pickedColor = undefined;

    let amount = 1;
    if (this.settings.duplicates === UnoSettingDuplicates.ON && card.type <= UnoCardType.N_9) {
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] === card) {
          cards.splice(i, 1);
          amount++;
        }
      }
    }

    this.broadcastPacket(SocketMessageType.UNO_USE, {player: player, usedCard: card, usedAmount: amount, left: cards.length}, player);
    this.sendPacket(player, SocketMessageType.UNO_CONFIRM, {cards: cards, card: card, amount: amount});

    if (cards.length === 0) {
      this.placement.push(player);
      this.cards.delete(player);

      if (this.cards.size === 1) {
        this.placement.push(Array.from(this.cards.keys())[0]);
        this.broadcastPacket(SocketMessageType.UNO_WIN, {player: player, end: true, placement: this.placement});
        this.ingame = false;
        return;
      } else {
        this.broadcastPacket(SocketMessageType.UNO_WIN, {player: player, end: false});
      }
    }

    switch (card.type) {
      case UnoCardType.PICK_DRAW_4: // +4
        this.drawCounter += 4;
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {drawCounter: this.drawCounter});
        return;
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
      case UnoCardType.DRAW_2: // +2
        this.drawCounter += 2;
        this.broadcastPacket(SocketMessageType.UNO_EFFECT, {drawCounter: this.drawCounter});
        break;
    }

    const nextPlayer = this.nextPlayerInDirection();
    this.broadcastPacket(SocketMessageType.UNO_NEXT, {player: nextPlayer});
  }

  canUseCardNow(card: UnoCardItem): boolean {
    return canUseCard(this.settings, this.pickedColor || this.topCard!!.color, this.topCard!!.type, this.drawCounter, card);
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

    this.drawCounter = 0;
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

  nextPlayerInDirection(iteration: number = 0): PlayerId {
    if (iteration > 100) throw new AssertionError();

    if (this.direction === UnoDirection.CLOCKWISE) this.current++;
    else this.current--;

    if (this.current >= this.order.length) this.current = 0;
    if (this.current < 0) this.current = this.order.length - 1;

    if (!this.cards.has(this.order[this.current]))
      return this.nextPlayerInDirection(iteration + 1);

    return this.order[this.current];
  }

  currentPlayer(): PlayerId {
    return this.order[this.current];
  }

}

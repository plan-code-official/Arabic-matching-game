import type { Card } from '../data/cardData';

export type MpMessage =
  | { type: 'JOIN'; playerName: string }
  | { type: 'READY'; opponentName: string; deck: Card[] }
  | { type: 'FLIP'; cardIds: string[] }
  | { type: 'EMOJI'; emoji: string }
  | { type: 'RESTART' }
  | { type: 'LEAVE' };

export class MultiplayerService {
  private channel: BroadcastChannel | null = null;
  private onMessageCallback: (msg: MpMessage) => void = () => {};
  public isConnected: boolean = false;
  public role: 'host' | 'client' = 'host';
  public opponentName: string = '';

  constructor(roomCode: string, private playerName: string) {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`memory_game_room_${roomCode}`);
      this.channel.onmessage = (event) => {
        const msg = event.data as MpMessage;
        if (msg.type === 'JOIN') {
          this.opponentName = msg.playerName;
          this.isConnected = true;
          // If we receive a JOIN, we are the Host. Send the READY message with deck.
          // The caller will trigger sending deck.
        } else if (msg.type === 'READY') {
          this.opponentName = msg.opponentName;
          this.isConnected = true;
          this.role = 'client';
        }
        this.onMessageCallback(msg);
      };
    }
  }

  onMessage(callback: (msg: MpMessage) => void) {
    this.onMessageCallback = callback;
  }

  join() {
    if (this.channel) {
      this.channel.postMessage({ type: 'JOIN', playerName: this.playerName });
    }
  }

  sendReady(opponentName: string, deck: Card[]) {
    if (this.channel) {
      this.channel.postMessage({ type: 'READY', opponentName, deck });
      this.isConnected = true;
    }
  }

  sendFlip(cardIds: string[]) {
    if (this.channel) {
      this.channel.postMessage({ type: 'FLIP', cardIds });
    }
  }

  sendEmoji(emoji: string) {
    if (this.channel) {
      this.channel.postMessage({ type: 'EMOJI', emoji });
    }
  }

  sendRestart() {
    if (this.channel) {
      this.channel.postMessage({ type: 'RESTART' });
    }
  }

  leave() {
    if (this.channel) {
      this.channel.postMessage({ type: 'LEAVE' });
      this.channel.close();
    }
    this.isConnected = false;
  }
}

/**
 * Radar Cognitivo - P2P Room Client (Estudante conectando via WebRTC DataChannel)
 * 
 * Conecta diretamente ao navegador do professor (Host) sem passar por servidores ou bancos de dados.
 * Custo ZERO, latência mínima e reconexão automática com token local.
 */

import { Peer, DataConnection } from 'peerjs';
import { Category } from '../types';
import { P2PLiveRoomState, P2PStudentMessage, P2PTeacherMessage } from './p2pTypes';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

export interface P2PClientCallbacks {
  onStatusChange: (status: 'connecting' | 'connected' | 'error' | 'disconnected', message?: string) => void;
  onJoined: (info: { participantToken: string; nickname: string; roomCode: string }) => void;
  onStateUpdate: (state: P2PLiveRoomState) => void;
  onKicked: (reason?: string) => void;
}

export class P2PRoomClient {
  public roomCode: string;
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private participantToken: string | null = null;
  private nickname: string = '';
  private callbacks: P2PClientCallbacks;
  private heartbeatInterval?: any;
  private isDestroyed = false;

  constructor(roomCode: string, callbacks: P2PClientCallbacks) {
    this.roomCode = roomCode.toUpperCase().trim();
    this.callbacks = callbacks;
  }

  public join(nickname: string, existingToken?: string) {
    this.nickname = nickname.trim();
    this.participantToken = existingToken || null;
    this.callbacks.onStatusChange('connecting', 'Conectando ao professor via WebRTC...');

    try {
      // Cria peer anônimo para o estudante
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: ICE_SERVERS
        }
      });

      this.peer.on('open', () => {
        if (this.isDestroyed) return;
        this.connectToHost();
      });

      this.peer.on('disconnected', () => {
        if (this.peer && !this.peer.destroyed && !this.isDestroyed) {
          try {
            this.peer.reconnect();
          } catch (e) {}
        }
      });

      this.peer.on('error', (err: any) => {
        console.warn('P2P Client Peer error:', err);
        if (err.type === 'peer-unavailable') {
          this.callbacks.onStatusChange('error', 'Sala não encontrada. Verifique se o professor abriu a sala com este código no computador.');
        } else {
          this.callbacks.onStatusChange('error', 'Erro ao conectar via P2P: ' + (err.message || ''));
        }
      });
    } catch (e: any) {
      this.callbacks.onStatusChange('error', 'Não foi possível inicializar conexão WebRTC.');
    }
  }

  private connectToHost() {
    if (!this.peer || this.peer.destroyed || this.isDestroyed) return;

    const hostPeerId = `RADAR-${this.roomCode}`;
    const connection = this.peer.connect(hostPeerId, {
      reliable: true
    });

    this.conn = connection;

    connection.on('open', () => {
      this.callbacks.onStatusChange('connected', 'Conexão P2P estabelecida!');

      // Envia pedido de entrada
      const joinMsg: P2PStudentMessage = {
        type: 'JOIN',
        nickname: this.nickname,
        existingToken: this.participantToken || undefined
      };
      connection.send(joinMsg);

      // Inicia heartbeat
      this.startHeartbeat();
    });

    connection.on('data', (data: any) => {
      this.handleTeacherMessage(data as P2PTeacherMessage);
    });

    connection.on('close', () => {
      this.stopHeartbeat();
      if (!this.isDestroyed) {
        this.callbacks.onStatusChange('disconnected', 'Conexão com o professor interrompida. Tentando reconectar...');
        // Tentativa automática de reconexão P2P em 2 segundos
        setTimeout(() => {
          if (!this.isDestroyed && this.nickname) {
            this.connectToHost();
          }
        }, 2000);
      }
    });

    connection.on('error', (err) => {
      console.warn('P2P Client Conn error:', err);
      this.callbacks.onStatusChange('error', 'Erro na transmissão de dados P2P.');
    });
  }

  private handleTeacherMessage(msg: P2PTeacherMessage) {
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'JOIN_SUCCESS':
        this.participantToken = msg.participantToken;
        this.callbacks.onJoined({
          participantToken: msg.participantToken,
          nickname: msg.nickname,
          roomCode: msg.roomCode
        });
        break;

      case 'JOIN_ERROR':
        this.callbacks.onStatusChange('error', msg.error);
        break;

      case 'ROOM_UPDATE':
        this.callbacks.onStateUpdate(msg.state);
        break;

      case 'KICKED':
        this.callbacks.onKicked(msg.reason);
        this.destroy();
        break;
    }
  }

  public submitCategory(category: Category | 'depende_do_contexto' | null, wantsDiscussion: boolean) {
    if (!this.conn || !this.conn.open || !this.participantToken) return;
    const msg: P2PStudentMessage = {
      type: 'SUBMIT_CATEGORY',
      participantToken: this.participantToken,
      category,
      wantsDiscussion
    };
    this.conn.send(msg);
  }

  public submitJustification(justificationId: string) {
    if (!this.conn || !this.conn.open || !this.participantToken) return;
    const msg: P2PStudentMessage = {
      type: 'SUBMIT_JUSTIFICATION',
      participantToken: this.participantToken,
      justificationId
    };
    this.conn.send(msg);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.conn && this.conn.open && this.participantToken) {
        this.conn.send({
          type: 'HEARTBEAT',
          participantToken: this.participantToken
        } as P2PStudentMessage);
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.stopHeartbeat();
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
  }
}

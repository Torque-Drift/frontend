"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

// Tipos para notificações WebSocket
export interface PaymentNotification {
  type: 'subscription' | 'donation' | 'donation_received';
  status: 'confirmed' | 'pending' | 'failed';
  amount: number;
  txSignature?: string;
  details?: {
    expiresAt?: string;
    streamer?: string;
    donor?: string;
    message?: string;
  };
}

export interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (walletAddress: string) => void;
  disconnect: () => void;
  subscribeToNotifications: (callback: (notification: PaymentNotification) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3333';

export function WebSocketProvider({ children, apiUrl = WS_BASE_URL }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentWalletRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const notificationCallbacksRef = useRef<Set<(notification: PaymentNotification) => void>>(new Set());

  // Função para conectar ao WebSocket
  const connect = useCallback((walletAddress: string) => {
    if (socket?.connected && currentWalletRef.current === walletAddress) {
      return; // Já conectado com a mesma wallet
    }

    // Desconectar socket anterior se existir
    if (socket) {
      socket.disconnect();
    }

    console.log('🔌 Conectando WebSocket para wallet:', walletAddress);

    const newSocket = io(`${apiUrl}/payments`, {
      query: { walletAddress },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });

    // Configurar event listeners
    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
      newSocket.emit('join', { walletAddress });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Erro de conexão WebSocket:', error);
      setIsConnected(false);
    });

    // Listener principal para notificações de pagamento
    newSocket.on('payment_notification', (notification: PaymentNotification) => {
      console.log('📨 Notificação recebida:', notification);

      // Chamar todos os callbacks registrados
      notificationCallbacksRef.current.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Erro em callback de notificação:', error);
        }
      });
    });

    setSocket(newSocket);
    socketRef.current = newSocket;
    currentWalletRef.current = walletAddress;
  }, [socket?.connected, apiUrl]);

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (socket) {
      console.log('🔌 Desconectando WebSocket');
      socket.disconnect();
      setSocket(null);
      socketRef.current = null;
      setIsConnected(false);
      currentWalletRef.current = null;
      notificationCallbacksRef.current.clear();
    }
  }, [socket]);

  // Função para subscrever a notificações
  const subscribeToNotifications = (callback: (notification: PaymentNotification) => void) => {
    notificationCallbacksRef.current.add(callback);

    // Retornar função para cancelar inscrição
    return () => {
      notificationCallbacksRef.current.delete(callback);
    };
  };

  // Cleanup automático quando o componente é desmontado
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Reconectar automaticamente se perder conexão
  useEffect(() => {
    if (!socketRef.current || !currentWalletRef.current) return;

    const handleDisconnect = () => {
      console.log('🔄 WebSocket desconectado, tentando reconectar em 5 segundos...');
      setTimeout(() => {
        if (currentWalletRef.current) {
          console.log('🔄 Tentando reconectar WebSocket...');
          connect(currentWalletRef.current);
        }
      }, 5000);
    };

    socketRef.current.on('disconnect', handleDisconnect);

    return () => {
      socketRef.current?.off('disconnect', handleDisconnect);
    };
  }, [connect]);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    subscribeToNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook para usar o WebSocket
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket deve ser usado dentro de um WebSocketProvider');
  }
  return context;
}

// Hook específico para notificações de pagamento
export function usePaymentNotifications() {
  const { subscribeToNotifications, isConnected } = useWebSocket();

  return {
    subscribeToNotifications,
    isConnected,
  };
}

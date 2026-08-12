import { Response } from 'express';

const clients = new Set<Response>();

export const realtimeService = {
  addClient(res: Response) {
    clients.add(res);
  },

  removeClient(res: Response) {
    clients.delete(res);
  },

  broadcastUpdate() {
    const data = JSON.stringify({ type: 'update', timestamp: new Date().toISOString() });
    clients.forEach((client) => {
      try {
        client.write(`data: ${data}\n\n`);
      } catch (err) {
        console.error('Failed to write to client, removing:', err);
        clients.delete(client);
      }
    });
  },

  getClientCount() {
    return clients.size;
  }
};

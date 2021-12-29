/**
 * Simple Singleton IIFE to make sure we only have one
 * socket instance at a time. This helps preventing
 * new sockets being createed when App re-renders.
 */
export const SocketController = (() => {
  let socket: DeltaSocket;
  return {
    init: (url: string, onMessageHandler: any) => {
      if (!socket) {
        socket = new DeltaSocket(url);
        return socket;
      } else {
        return socket;
      }
    },
    getInstance: () => {
      if (!socket) {
        throw Error(
          `No Socket connection Established. Use SocketController.init() before calling getInstance()`
        );
      } else {
        return socket;
      }
    },
  };
})();

class DeltaSocket {
  socket: WebSocket;
  constructor(url: string) {
    this.socket = new WebSocket(url);
  }
}

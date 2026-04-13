/**
 * WebSocket helper – returns a connected WebSocket for a given path.
 * The JWT access token is passed as a query parameter.
 *
 * Usage:
 *   const ws = createWebSocket(`/ws/messages/${friendId}/`);
 *   ws.onmessage = (e) => { ... };
 *   ws.onclose   = ()  => { ... };
 *   // cleanup:
 *   ws.close();
 */

const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ||
  (window.location.protocol === 'https:' ? 'wss://localhost' : 'ws://localhost');

export function createWebSocket(path) {
  const token = localStorage.getItem('access_token') || '';
  return new WebSocket(`${WS_BASE_URL}${path}?token=${token}`);
}

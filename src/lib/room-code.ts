/**
 * Generates a unique 6-character alphanumeric room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validates a room code format
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z2-9]{6}$/.test(code);
}


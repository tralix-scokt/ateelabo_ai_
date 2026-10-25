export const sessionName = 'ateelabo_session';
export function sessionToken(req) {
  const header = req.headers.authorization;
  if (header) return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  try {
    const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(`${sessionName}=`));
    return cookie ? decodeURIComponent(cookie.slice(sessionName.length + 1)) : null;
  } catch { return null; }
}
export function sessionOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' };
}

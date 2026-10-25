// Do not let corrupt browser data prevent the application from rendering.
export function readJSON(key, fallback = null, storage) {
  try { return JSON.parse((storage || globalThis.localStorage).getItem(key)) ?? fallback; }
  catch { return fallback; }
}
export function historyKey(user) {
  return `ateelabo_chats:${user?.id || user?._id || "guest"}`;
}
export function loadChats(key, storage) {
  const value = readJSON(key, [], storage);
  if (!Array.isArray(value)) return [];
  return value.filter(chat => chat && ['string', 'number'].includes(typeof chat.id) && typeof chat.title === 'string' &&
    Array.isArray(chat.messages) && chat.messages.every(message => message &&
      ['user', 'ai'].includes(message.role) && typeof message.text === 'string' &&
      (message.time == null || typeof message.time === 'string') &&
      (message.fileName == null || typeof message.fileName === 'string')))
    .map(chat => ({ ...chat, fileContext: typeof chat.fileContext === 'string' ? chat.fileContext.slice(0, 30000) : '' }));
}

export function readUser(storage) {
  const user = readJSON('ateelabo_user', null, storage);
  if (!user || typeof user !== 'object' || typeof (user.id || user._id) !== 'string' ||
      typeof user.name !== 'string' || (user.email != null && typeof user.email !== 'string')) return null;
  return { ...user, id: user.id || user._id, role: user.role === 'admin' ? 'admin' : 'user',
    profilePicture: typeof user.profilePicture === 'string' ? user.profilePicture : '' };
}

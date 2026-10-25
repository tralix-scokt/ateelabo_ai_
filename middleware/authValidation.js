export const validEmail = value => typeof value === 'string' && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
// bcrypt truncates input after 72 bytes; reject rather than silently truncate.
export const validPassword = value => typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value, 'utf8') <= 72;
export function registrationInput(req, res, next) {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || !validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ message: 'Provide a name (1–100 characters), valid email, and password of at least 8 characters and at most 72 UTF-8 bytes.' });
  }
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}
export function passwordInput(req, res, next) {
  const { email, currentPassword, newPassword } = req.body || {};
  if (!validEmail(email) || typeof currentPassword !== 'string' || !currentPassword || Buffer.byteLength(currentPassword) > 128 || !validPassword(newPassword)) {
    return res.status(400).json({ message: 'Provide valid credentials and a new password of at least 8 characters and at most 72 UTF-8 bytes.' });
  }
  req.body.email = email.trim().toLowerCase();
  next();
}

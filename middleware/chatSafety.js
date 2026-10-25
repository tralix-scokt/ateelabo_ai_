import fs from "node:fs";
import multer from "multer";
import { parseHistory } from "../services/chatContext.js";
import rateLimit from "express-rate-limit";

export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many chat requests. Please try again later." },
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 4, fieldSize: 256 * 1024 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const supported =
      (name.endsWith(".pdf") && file.mimetype === "application/pdf") ||
      (name.endsWith(".docx") && file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    cb(supported ? null : new Error("Only PDF and DOCX files are supported."), supported);
  },
}).single("file");

export function chatUpload(req, res, next) {
  upload(req, res, (error) => {
    if (!error) return next();
    return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      error: error.code === "LIMIT_FILE_SIZE"
        ? "File exceeds the 10 MB limit."
        : "Upload rejected. Use one PDF or DOCX file (maximum 10 MB).",
    });
  });
}

export function validateChat(req, res, next) {
  const { message, fileContext } = req.body || {};
  try { req.chatHistory = parseHistory(req.body?.history); }
  catch {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Invalid or oversized conversation history." });
  }
  if (typeof message === "string" && message.length <= 10000 &&
      (message.trim() || req.file) &&
      (fileContext === undefined ||
        (typeof fileContext === "string" && fileContext.length <= 30000))) {
    return next();
  }
  if (req.file?.path) fs.unlink(req.file.path, () => {});
  return res.status(400).json({ error: "Provide a message of at most 10,000 characters or a document; document context must not exceed 30,000 characters." });
}

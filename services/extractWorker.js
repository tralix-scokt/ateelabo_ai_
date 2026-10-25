// Isolate untrusted document parsing from the HTTP server. Parent enforces heap/time/concurrency limits.
import fs from 'node:fs';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
try {
  const [filePath, type] = process.argv.slice(2);
  let text;
  if (type === 'pdf') {
    const parser = new PDFParse({ data: fs.readFileSync(filePath) });
    try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
  } else { text = (await mammoth.extractRawText({ path: filePath })).value; }
  if (!text?.trim()) throw new Error('No extractable text');
  process.send({ text: text.slice(0, 30000) }, () => process.disconnect());
} catch {
  process.exitCode = 1;
  if (process.connected) process.disconnect();
}

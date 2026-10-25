import { fork } from 'node:child_process';
import { open } from 'node:fs/promises';
let active = 0;
export async function extractDocument(filePath, type) {
  const handle = await open(filePath, 'r');
  const signature = Buffer.alloc(5);
  try { await handle.read(signature, 0, 5, 0); } finally { await handle.close(); }
  const valid = type === 'pdf' ? signature.toString() === '%PDF-' : signature.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  if (!valid) throw Object.assign(new Error('Invalid document contents.'), { status: 400 });
  if (active >= 2) throw Object.assign(new Error('Document processing is busy. Please try again.'), { status: 503 });
  active++;
  try {
    return await new Promise((resolve, reject) => {
      const child = fork(new URL('./extractWorker.js', import.meta.url), [filePath, type], {
        execArgv: ['--max-old-space-size=192'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      });
      let result;
      let timedOut = false;
      const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, 15000);
      child.on('message', message => { result = message; });
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', code => {
        clearTimeout(timer);
        if (!timedOut && code === 0 && typeof result?.text === 'string') resolve(result.text);
        else reject(Object.assign(new Error(timedOut ? 'Document processing timed out.' : 'Unable to read document. It may be invalid or too complex.'), { status: 400 }));
      });
    });
  } finally { active--; }
}

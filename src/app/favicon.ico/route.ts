import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function GET() {
  const png = await readFile(join(process.cwd(), 'public', 'favicon-32.png'));
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

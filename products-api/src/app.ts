import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { productInput, productPatch, productSchema, type Product } from '@products/contracts';

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    request.resume();
    throw new HttpError(415, 'Use Content-Type: application/json');
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size <= 16_384) chunks.push(chunk);
  }
  if (size > 16_384) throw new HttpError(413, 'Request body exceeds 16 KB');
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'Invalid JSON body'); }
}

function send(response: ServerResponse, status: number, data?: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(data === undefined ? undefined : JSON.stringify(data));
}

export function createApp() {
  const products = new Map<string, Product>();
  return createServer(async (request, response) => {
    try {
      const path = new URL(request.url ?? '/', 'http://localhost').pathname;
      const match = /^\/api\/products(?:\/([^/]+))?\/?$/.exec(path);
      if (!match) throw new HttpError(404, 'Route not found');
      const id = match[1];
      const method = request.method;
      const allowed = id ? ['GET', 'PUT', 'PATCH', 'DELETE'] : ['GET', 'POST'];
      if (!allowed.includes(method ?? '')) {
        response.setHeader('Allow', allowed.join(', '));
        throw new HttpError(405, 'Method not allowed');
      }
      if (!id && method === 'GET') return send(response, 200, [...products.values()].map(p => productSchema.parse(p)));
      if (!id && method === 'POST') {
        const parsed = productInput.safeParse(await readBody(request));
        if (!parsed.success) return send(response, 400, { error: 'Invalid product', details: parsed.error.issues });
        const now = new Date().toISOString();
        const product = productSchema.parse({ ...parsed.data, id: randomUUID(), createdAt: now, updatedAt: now });
        products.set(product.id, product);
        response.setHeader('Location', `/api/products/${product.id}`);
        return send(response, 201, product);
      }
      const product = products.get(id!);
      if (!product) throw new HttpError(404, 'Product not found');
      if (method === 'GET') return send(response, 200, productSchema.parse(product));
      if (method === 'DELETE') {
        products.delete(id!);
        return send(response, 204);
      }
      const parsed = (method === 'PUT' ? productInput : productPatch).safeParse(await readBody(request));
      if (!parsed.success) return send(response, 400, { error: 'Invalid product', details: parsed.error.issues });
      // Re-check after reading the body: another request may have deleted this product.
      const current = products.get(id!);
      if (!current) throw new HttpError(404, 'Product not found');
      const next = productSchema.parse({ ...current, ...parsed.data });
      if (JSON.stringify(next) !== JSON.stringify(current)) next.updatedAt = new Date().toISOString();
      products.set(id!, next);
      return send(response, 200, next);
    } catch (error) {
      send(response, error instanceof HttpError ? error.status : 500,
        { error: error instanceof HttpError ? error.message : 'Internal server error' });
    }
  });
}

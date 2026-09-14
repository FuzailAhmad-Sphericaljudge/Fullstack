import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.ts';

test('product lifecycle, contracts, invalid requests, retries and no-op updates', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api/products`;
  const call = (method: string, path = '', body?: unknown) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  try {
    assert.deepEqual(await (await call('GET')).json(), []);
    const created = await call('POST', '', { name: 'Keyboard', price: 49.99, stock: 5 });
    assert.equal(created.status, 201);
    const product = await created.json();
    const path = `/${product.id}`;
    assert.equal(created.headers.get('location'), '/api/products' + path);
    assert.equal(new Date(product.createdAt).toISOString(), product.createdAt);
    assert.deepEqual(await (await call('GET', path)).json(), product);
    assert.equal((await (await call('GET')).json()).length, 1);
    assert.equal((await call('POST', '', { name: '', price: -1 })).status, 400);
    assert.equal((await call('POST', '', { name: 'Bad', price: '2' })).status, 400);
    assert.equal((await call('PATCH', path, { id: 'bad' })).status, 400);
    assert.equal((await call('PATCH', path, {})).status, 400);
    assert.deepEqual(await (await call('PATCH', path, { stock: 5 })).json(), product);
    const replaced = await call('PUT', path, { name: 'Mouse', price: 20 });
    assert.equal(replaced.status, 200);
    const replacement = await replaced.json();
    assert.equal(replacement.stock, 0);
    assert.equal(replacement.createdAt, product.createdAt);
    assert.deepEqual(await (await call('PUT', path, { name: 'Mouse', price: 20 })).json(), replacement);
    const patched = await call('PATCH', path, { stock: 8 });
    assert.equal(patched.status, 200);
    assert.equal((await patched.json()).stock, 8);
    // Repeated creates are separate resources, even with identical input.
    const duplicate = await (await call('POST', '', { name: 'Mouse', price: 20 })).json();
    assert.notEqual(duplicate.id, product.id);
    assert.equal((await call('DELETE', `/${duplicate.id}`)).status, 204);
    assert.equal((await call('DELETE', path)).status, 204);
    for (const method of ['GET', 'DELETE', 'PUT', 'PATCH']) assert.equal((await call(method, path)).status, 404);
    assert.deepEqual(await (await call('GET')).json(), []);
    assert.equal((await call('PUT', '', {})).status, 405);
    assert.equal((await fetch(base + '/a/b')).status, 404);
    assert.equal((await fetch(base, { method: 'POST', body: '{}' })).status, 415);
    assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    assert.equal((await call('POST', '', { name: 'x'.repeat(17000), price: 1 })).status, 413);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});

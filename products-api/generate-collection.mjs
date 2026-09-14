import { writeFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const created = new Date().toISOString();
const collectionId = randomUUID();
const requests = [];
function add(name, method, path, status, body, extraTests = [], contentType = 'application/json') {
  requests.push({ _id: randomUUID(), colId: collectionId, containerId: '', name,
    url: `http://localhost:3001/api/products${path}`, method, sortNum: requests.length * 10000,
    created, modified: created, headers: [{ name: 'Content-Type', value: contentType }], params: [],
    ...(body === undefined ? {} : { body: { type: 'json', raw: typeof body === 'string' ? body : JSON.stringify(body), form: [] } }),
    tests: [{ type: 'res-code', custom: '', action: 'equal', value: String(status) }, ...extraTests],
  });
}
add('01 List products', 'GET', '', 200);
add('02 Create product', 'POST', '', 201, { name: 'Keyboard', price: 49.99, stock: 5 },
  [{ type: 'set-env-var', custom: 'json.id', action: 'setto', value: '{{productId}}' }]);
add('03 Get product', 'GET', '/{{productId}}', 200);
add('04 Replace product', 'PUT', '/{{productId}}', 200, { name: 'Mouse', price: 20 });
add('05 Patch product', 'PATCH', '/{{productId}}', 200, { stock: 8 });
add('06 Reject negative price', 'POST', '', 400, { name: 'Bad', price: -1 });
add('07 Reject empty patch', 'PATCH', '/{{productId}}', 400, {});
add('08 Reject malformed JSON', 'POST', '', 400, '{');
add('09 Reject content type', 'POST', '', 415, '{}', [], 'text/plain');
add('10 Reject unsupported method', 'PUT', '', 405, {});
add('11 Delete product', 'DELETE', '/{{productId}}', 204);
add('12 Deleted product is missing', 'GET', '/{{productId}}', 404);
add('13 Repeat delete', 'DELETE', '/{{productId}}', 404);
writeFileSync(new URL('./thunder-collection_products.json', import.meta.url), JSON.stringify({
  clientName: 'Thunder Client', collectionName: 'Products API', collectionId, version: '1.2', dateExported: created,
  folders: [], requests,
}, null, 2) + '\n');
mkdirSync(new URL('./thunder-tests/environments/', import.meta.url), { recursive: true });
writeFileSync(new URL('./thunder-tests/environments/tc_env_products-local.json', import.meta.url), JSON.stringify({
  _id: randomUUID(), name: 'Products Local', default: true, sortNum: 10000, created, modified: created,
  data: [{ name: 'productId', value: '' }],
}, null, 2) + '\n');
mkdirSync(new URL('./thunder-tests/collections/', import.meta.url), { recursive: true });
writeFileSync(new URL('./thunder-tests/collections/tc_col_products-api.json', import.meta.url), JSON.stringify({
  _id: collectionId, colName: 'Products API', created, modified: created, sortNum: 10000,
  folders: [], requests,
}, null, 2) + '\n');

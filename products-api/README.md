# Products REST API

Requires Node.js 24. From this directory run `npm.cmd install`, then `npm.cmd start`.
The server listens at `http://localhost:3001`. Set `PORT` to change it.
Products are stored in memory and reset when the process restarts.

| Method | URL | Result |
| --- | --- | --- |
| GET | /api/products | List products (200) |
| POST | /api/products | Create a product (201) |
| GET | /api/products/:id | Get a product (200) |
| PUT | /api/products/:id | Replace product fields (200) |
| PATCH | /api/products/:id | Update selected fields (200) |
| DELETE | /api/products/:id | Delete a product (204) |

POST and PUT require `name` and `price`. Optional `description` and `stock`
default to an empty string and zero. PATCH requires at least one field.
Send `Content-Type: application/json` with this example body:

```json
{"name":"Keyboard","price":49.99,"description":"USB keyboard","stock":10}
```

Responses include a generated UUID `id` and UTC `createdAt`/`updatedAt` timestamps.
Copy the returned ID into the item URL. Unknown fields and invalid values return
400; unknown products return 404. Repeated POST requests create separate products.
PUT and PATCH with unchanged values preserve `updatedAt`.

## Thunder Client

Start the API and run `npm.cmd run test:thunder` in a second terminal.
All 13 requests passed using Thunder Client CLI on 2026-09-08;
see `test-results/thunder-products.json` for the report.

For the VS Code UI, open this `products-api` folder as the workspace. The included
workspace settings load the collection and `Products Local` environment from
`thunder-tests`. Select that environment and run `Products API` sequentially.
The create request saves the returned ID as `productId` for subsequent requests.
An exported collection is also available as `thunder-collection_products.json`;
when importing it separately, create an environment with a `productId` variable.

If your Thunder Client plan does not support import or collection execution,
create requests manually using the methods, URLs and bodies above. For PUT use
`{"name":"Mouse","price":20}` and for PATCH use `{"stock":8}`. Test DELETE last,
then GET the deleted ID to check the 404 response.

## Automated verification

Run `npm.cmd run verify` for strict TypeScript checking and HTTP integration tests.

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

Remember the Clouflare Worker types must match with the wrangler version (check documentation) in package.json i.e.

```ts
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20260305.0",
    "wrangler": "^4.69.0"
  }
```
After that generate worker-configuration.d.ts using 
```bash
pnpm run cf-typegen
```

and make sure that the tsconfig.json has
```bash
  "compilerOptions": {
    ...
    "types": ["./worker-configuration.d.ts"],
    ...
  }
```

where as the wrangler.jsonc or wrangler.toml, date should not exceed from today
"compatibility_date": "2026-02-28", 




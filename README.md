# agent-console monorepo

Single repo for:

- `packages/cli` → TypeScript npm package `agent-console` (`npx agent-console rmbg image.jpg`)
- `apps/landing` → TypeScript + static landing page used for Vercel deploy

## Workspace commands

```sh
npm install
npm run build
npm test
npm run pack:check
npm run dev:landing
```

## Publish CLI package

```sh
npm --workspace agent-console publish --access public
```

## Deploy landing

```sh
npm run deploy:landing
```

## License

MIT.

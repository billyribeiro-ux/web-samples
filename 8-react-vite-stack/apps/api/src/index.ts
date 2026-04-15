import 'dotenv/config';
import { loadEnv } from './lib/env.js';
import { createApp } from './app.js';

const env = loadEnv();
const app = createApp(env);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

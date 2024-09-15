import { Application } from "./src/application";

const app = new Application();

(async () => {
  if (app.isSeed) {
    await app.runSeeder();
  } else {
    await app.start();
  }
})();

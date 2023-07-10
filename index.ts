import { App } from "./app";
import { MazeApiService } from "./services/maze-api.service";

// Basic async startup
(async () => {
  const mazeApiService = new MazeApiService();
  const app = new App(mazeApiService);
  await app.appLoop();
})();

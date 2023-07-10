import Enquirer from "Enquirer";
import ora from "ora";
import { MazeApiService } from "./services/maze-api.service";
import { MazeInfo } from "./models/maze-info.model";
import { MazeRunnerService } from "./services/maze-runner.service";
import { PlayerInfo } from "./models/player-info.model";

enum MainMenuItem {
  Play = "play",
  PlayerInfo = "playerInfo",
  ResetPlayer = "resetPlayer",
  Exit = "exit",
}

enum State {
  OnMainMenu,
  PickingMaze,
  PlayingMaze,
}

export class App {
  private _enquirer = new Enquirer<{
    // Declaring all questions I will ask
    playerName: string;
    mainMenu: MainMenuItem;
    maze: string;
    resetProgress: boolean;
  }>();
  private _gameState: State = State.OnMainMenu;
  private _playerInfo?: PlayerInfo;
  private _mazeName?: string;

  private _mazeRunner?: MazeRunnerService;

  constructor(private _apiService: MazeApiService) {}

  public async appLoop(): Promise<void> {
    while (true) {
      if (!this._playerInfo) {
        try {
          this._playerInfo = await this._apiService.playerInfo();
          console.log("gottem");
        } catch {
          await this._apiService.registerPlayer(await this._askPlayerName());
          this._playerInfo = await this._apiService.playerInfo();
        }

        if (this._playerInfo.isInMaze) {
          this._mazeName = this._playerInfo.maze;
          await this._playMaze();
        }
      }

      switch (this._gameState) {
        case State.OnMainMenu:
          const option = await this._runMainMenu();

          if (option == MainMenuItem.Play) {
            this._gameState = State.PickingMaze;
          } else if (option == MainMenuItem.ResetPlayer) {
            this._apiService.resetPlayer();
            this._playerInfo = undefined;
          } else if (option == MainMenuItem.PlayerInfo) {
            this._playerInfo = await this._apiService.playerInfo();
            console.dir(this._playerInfo);
          } else {
            console.log("👋 Okay bye!");
            process.exit(0);
          }
          break;
        case State.PickingMaze:
          this._mazeName = await this._pickMaze();
          if (this._mazeName != "") {
            await this._apiService.enterMaze(this._mazeName);
            await this._playMaze();
          }
          break;
        case State.PlayingMaze:
          if (this._mazeName != "") {
            const spinner = ora(`Solving ${this._mazeName}`).start();

            await this._mazeRunner!.solve();

            spinner.stop();
            console.log("✔ Done solving, results below");

            this._gameState = State.OnMainMenu;
          }
          break;
      }
    }
  }

  private async _playMaze() {
    this._mazeRunner = new MazeRunnerService(
      await this._apiService.possibleMazeActions()
    );
    this._gameState = State.PlayingMaze;
  }

  private async _askPlayerName(): Promise<string> {
    const { playerName } = await this._enquirer.prompt({
      type: "input",
      name: "playerName",
      message: `Please enter a player name`,
    });

    return playerName;
  }

  private async _runMainMenu(): Promise<MainMenuItem> {
    const { mainMenu } = await this._enquirer.prompt({
      type: "select",
      name: "mainMenu",
      message: `Hello ${this._playerInfo?.name}! What would you like to do`,
      choices: [
        { name: "Play", message: "Play", value: MainMenuItem.Play },
        {
          name: "Reset Player",
          message: "Reset Player",
          value: MainMenuItem.ResetPlayer,
          hint: "This will reset all your progress and sign you out",
        },
        {
          name: "Player Info",
          message: "Player Info",
          value: MainMenuItem.PlayerInfo,
        },
        { name: "Exit", message: "Exit", value: MainMenuItem.Exit },
      ],
      result(value) {
        // Nice ts support... 😡
        return (this as any).focused.value;
      },
    });

    return mainMenu;
  }

  private async _pickMaze(): Promise<string> {
    const mazes: MazeInfo[] = await this._apiService.getAllMazes();

    if (!mazes.length) {
      console.log("✖ It appears we did not find a single maze to play!");
      this._gameState = State.OnMainMenu;
      return "";
    }

    const { maze } = await this._enquirer.prompt({
      type: "autocomplete",
      name: "maze",
      message: `Alright! Pick a maze to start`,
      choices: mazes.map((maze) => ({
        name: maze.name,
        hint: `Reward: ${maze.potentialReward}, Tiles: ${maze.totalTiles}`,
      })),
    });

    return maze;
  }
}

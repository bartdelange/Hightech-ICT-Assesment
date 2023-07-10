import Enquirer from "Enquirer";
import ora from "ora";
import { MazeApiService } from "./services/maze-api.service";
import { MazeInfo } from "./models/maze-info.model";

enum MainMenuItem {
  Play = "play",
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
  private _playerName?: string;
  private _mazeName?: string;

  constructor(private _apiService: MazeApiService) {}

  public async appLoop(): Promise<void> {
    while (true) {
      if (!this._playerName) {
        this._playerName = await this._askPlayerName();
      }

      switch (this._gameState) {
        case State.OnMainMenu:
          const option = await this._runMainMenu();

          if (option == MainMenuItem.Play) {
            this._gameState = State.PickingMaze;
          } else if (option == MainMenuItem.ResetPlayer) {
            this._playerName = undefined;
          } else {
            console.log("👋 Okay bye!");
            process.exit(0);
          }
          break;
        case State.PickingMaze:
          this._mazeName = await this._pickMaze();
          if (this._mazeName != "") {
            this._gameState = State.PlayingMaze;
          }
          break;
        case State.PlayingMaze:
          const spinner = ora("Solving the maze").start();
          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });
          spinner.stop();
          console.log("✔ Done solving, results below");
          this._gameState = State.OnMainMenu;
          break;
      }
    }
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
      message: `Hello ${this._playerName}! What would you like to do`,
      choices: [
        { name: "Play", message: "Play", value: MainMenuItem.Play },
        {
          name: "Reset Player",
          message: "Reset Player",
          value: MainMenuItem.ResetPlayer,
          hint: "This will reset all your progress and sign you out",
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
      console.log("❌ It appears we did not find a single maze to play!");
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

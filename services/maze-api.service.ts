import axios, { AxiosInstance } from "axios";
import { PlayerInfo } from "../models/player-info.model";
import { MazeInfo } from "../models/maze-info.model";
import { PossibleActionsAndCurrentScore } from "../models/possible-actions-and-current-score.model";

export class MazeApiService {
  private _client: AxiosInstance = axios.create({
    baseURL: "https://maze.hightechict.nl/api/",
    headers: { Authorization: "HTI Thanks You [7K0]" },
  });

  // Player logic
  public async registerPlayer(playerName: string): Promise<void> {
    return await this._client.post("player/register", {
      name: playerName,
    });
  }

  public async playerInfo(): Promise<PlayerInfo> {
    return await this._client.get("player");
  }

  public async resetPlayer(): Promise<void> {
    await this._client.delete("player/forget");
  }

  // Mazes
  public async getAllMazes(): Promise<MazeInfo[]> {
    return await this._client.get("mazes/all").then((resp) => resp.data);
  }

  public async enterMaze(
    mazeName: string
  ): Promise<PossibleActionsAndCurrentScore[]> {
    return await this._client
      .post("mazes/enter", { mazeName })
      .then((resp) => resp.data);
  }
}

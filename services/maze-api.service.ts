import axios, { AxiosInstance } from "axios";
import { PlayerInfo } from "../models/player-info.model";
import { MazeInfo } from "../models/maze-info.model";
import { PossibleActionsAndCurrentScore } from "../models/possible-actions-and-current-score.model";
import { Direction } from "../enums/direction.enum";

export class MazeApiService {
  private _client: AxiosInstance = axios.create({
    baseURL: "https://maze.hightechict.nl/api/",
    headers: { Authorization: "HTI Thanks You [7K0]" },
  });

  // Player logic
  public async registerPlayer(playerName: string): Promise<void> {
    return await this._client.post("player/register", null, {
      params: {
        name: playerName,
      },
    });
  }

  public async playerInfo(): Promise<PlayerInfo> {
    return await this._client.get("player").then((resp) => resp.data);
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
  ): Promise<PossibleActionsAndCurrentScore> {
    return await this._client
      .post("mazes/enter", null, { params: { mazeName } })
      .then((resp) => resp.data);
  }

  // Inside the maze
  public async possibleMazeActions(): Promise<PossibleActionsAndCurrentScore> {
    return await this._client
      .get("maze/possibleActions")
      .then((resp) => resp.data);
  }

  public async moveInMaze(
    direction: Direction
  ): Promise<PossibleActionsAndCurrentScore> {
    return await this._client
      .post("maze/move", null, { params: { direction } })
      .then((resp) => resp.data);
  }

  public async tagMazeTile(
    tagValue: number
  ): Promise<PossibleActionsAndCurrentScore> {
    return await this._client
      .post("maze/tag", null, { params: { tagValue } })
      .then((resp) => resp.data);
  }

  public async collectScoreOnTile(): Promise<PossibleActionsAndCurrentScore> {
    return await this._client
      .post("maze/collectScore")
      .then((resp) => resp.data);
  }

  public async exitMaze(): Promise<void> {
    await this._client.post("maze/exit");
  }
}

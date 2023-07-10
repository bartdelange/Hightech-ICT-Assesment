import { Direction } from "../enums/direction.enum";
import { MoveAction } from "../models/move-action.model";
import { PossibleActionsAndCurrentScore } from "../models/possible-actions-and-current-score.model";
import { MazeApiService } from "./maze-api.service";

export class MazeRunnerService {
  private _mazeState: PossibleActionsAndCurrentScore;
  private _mazeSolved = false;
  private _currentTagWeight = 0;

  constructor(
    private _mazeApiService: MazeApiService,
    initialState: PossibleActionsAndCurrentScore
  ) {
    this._mazeState = initialState;
  }

  private _getBestNextMove(): MoveAction | undefined {
    // First we want only non visited tiles
    const nonVisited = this._mazeState.possibleMoveActions.filter(
      (tile) => !tile.hasBeenVisited
    );
    if (nonVisited.length) {
      // Get the one with the highest score value
      nonVisited.sort((a, b) => b.rewardOnDestination - a.rewardOnDestination);
      return nonVisited[0];
    } else {
      // No none visited tiles?
      // Back track until we have one (using tags)
      return this._mazeState.possibleMoveActions.find(
        (tile) => tile.tagOnTile === this._currentTagWeight - 1
      );
    }
  }

  public async _move(direction: Direction, write: boolean) {
    this._mazeState = await this._mazeApiService.moveInMaze(direction);
    if (write) {
      this._mazeState = await this._mazeApiService.tagMazeTile(
        this._currentTagWeight + 1
      );
    }
    this._currentTagWeight = this._mazeState.tagOnCurrentTile;

    if (this._mazeState.canCollectScoreHere) {
      await this._mazeApiService.storeScoreToBag();
    }
  }

  public async solve(): Promise<void> {
    while (!this._mazeSolved) {
      const nextMove = this._getBestNextMove();
      if (nextMove) {
        await this._move(nextMove.direction, !nextMove.hasBeenVisited);
      } else {
        this._mazeSolved = true;
      }
    }

    // Figure out how to exit once we have visited all the tiles
  }
}

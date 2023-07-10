import { Direction } from "../enums/direction.enum";
import { MoveAction } from "../models/move-action.model";
import { PossibleActionsAndCurrentScore } from "../models/possible-actions-and-current-score.model";
import { MazeApiService } from "./maze-api.service";

export class MazeRunnerService {
  private _debugMoves: Direction[] = [];
  private _mazeState: PossibleActionsAndCurrentScore;
  private _allTilesVisited = false;
  private _currentTagWeight = 0;
  private _keepTrackOfExit = false;
  private _exitDirectionList: Direction[] = [];
  private _keepTrackOfStore = false;
  private _storeDirectionList: Direction[] = [];

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

  private _reverseDirection(originalDirection: Direction): Direction {
    switch (originalDirection) {
      case Direction.Right:
        return Direction.Left;
      case Direction.Down:
        return Direction.Up;
      case Direction.Left:
        return Direction.Right;
      case Direction.Up:
        return Direction.Down;
    }
  }

  private async _move(direction: Direction, write: boolean = false) {
    this._mazeState = await this._mazeApiService.moveInMaze(direction);
    this._debugMoves.push(direction);
    if (write) {
      this._mazeState = await this._mazeApiService.tagMazeTile(
        this._currentTagWeight + 1
      );
    }
    this._currentTagWeight = this._mazeState.tagOnCurrentTile;

    if (this._keepTrackOfExit) {
      this._exitDirectionList.push(direction);
    }

    if (this._keepTrackOfStore) {
      this._storeDirectionList.push(direction);
    }

    if (this._mazeState.canCollectScoreHere) {
      this._keepTrackOfStore = true;
      this._storeDirectionList = [];
      if (this._mazeState.currentScoreInHand) {
        await this._mazeApiService.storeScoreToBag();
      }
    }

    if (this._mazeState.canExitMazeHere) {
      this._keepTrackOfExit = true;
      this._exitDirectionList = [];
    }
  }

  public async solve(): Promise<void> {
    this._mazeState = await this._mazeApiService.tagMazeTile(
      this._currentTagWeight
    );

    // This is by no means the quickest way, since we basically brute force the maze. But it is a points collecting machine
    // The next version should also check if we already found al the points (in case of the needle maze) and then scour for a collection point and then for the exit
    // I don't see another aproach then the above since we "don't" know the maze beforehand
    // You could cheat by running it once, resetting your user and then using the previous runs as a guide using something like a*. But I wan't to play by the "rules"

    // Walk until we have stepped on all tiles
    while (!this._allTilesVisited) {
      const nextMove = this._getBestNextMove();
      if (nextMove) {
        await this._move(nextMove.direction, !nextMove.hasBeenVisited);
      } else {
        this._allTilesVisited = true;
      }
    }

    // Walking back to the last found store spot
    this._keepTrackOfStore = false;
    if (this._mazeState.currentScoreInHand != 0) {
      while (this._storeDirectionList.length) {
        const originalDirection = this._storeDirectionList.pop();
        if (originalDirection) {
          await this._move(this._reverseDirection(originalDirection));
        }
      }
    }

    // Walking back to the last found exit
    this._keepTrackOfExit = false;
    while (this._exitDirectionList.length) {
      const originalDirection = this._exitDirectionList.pop();
      if (originalDirection) {
        await this._move(this._reverseDirection(originalDirection));
      }
    }

    this._mazeApiService.exitMaze();
  }
}

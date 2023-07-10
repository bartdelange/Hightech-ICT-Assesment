import { PossibleActionsAndCurrentScore } from "../models/possible-actions-and-current-score.model";

export class MazeRunnerService {
  private _mazeState: PossibleActionsAndCurrentScore;
  private _mazeSolved = false;

  constructor(initialState: PossibleActionsAndCurrentScore) {
    this._mazeState = initialState;
  }

  private _getBestNextMove() {
    // First we want only non visited tiles
    // Get the one with the highest score value
    // No none visited tiles?
    // Back track until we have one (using tags)
  }

  public async solve(): Promise<void> {
    while (!this._mazeSolved) {}
  }
}

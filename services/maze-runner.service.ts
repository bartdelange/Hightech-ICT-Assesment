import { PossibleActionsAndCurrentScore } from "../models/possible-actions-and-current-score.model";

export class MazeRunnerService {
  private _mazeState: PossibleActionsAndCurrentScore;

  constructor(initialState: PossibleActionsAndCurrentScore) {
    this._mazeState = initialState;
  }

  public async solve(): Promise<void> {
    return Promise.resolve();
  }
}

import { MoveAction } from "./move-action.model";

export interface PossibleActionsAndCurrentScore {
  possibleMoveActions: MoveAction[];
  canCollectScoreHere: boolean;
  canExitMazeHere: boolean;
  currentScoreInHand: number;
  currentScoreInBag: number;
  tagOnCurrentTile: number;
}

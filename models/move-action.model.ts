import { Direction } from "../enums/direction.enum";

export interface MoveAction {
  direction: Direction;
  isStart: boolean;
  allowsExit: boolean;
  allowsScoreCollection: boolean;
  hasBeenVisited: boolean;
  rewardOnDestination: number;
  tagOnTile: number;
}

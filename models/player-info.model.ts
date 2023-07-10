export interface PlayerInfo {
  playerId: string;
  name: string;
  isInMaze: boolean;
  maze: string;
  hasFoundEasterEgg: boolean;
  mazeScoreInHand: number;
  mazeScoreInBag: number;
  playerScore: number;
}

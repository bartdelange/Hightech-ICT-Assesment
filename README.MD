# Maze Game

### _Prerequisites_

- A working [node](https://nodejs.org/en) environment (was made using node 18.3.0, but others should work just as well)
- A good maze fighting spirit (Don't worry, this will run the maze for you 😉)

## Setup

- Start by installing it all: `npm i`
- Add a .config.json file containing the follwing: `{ "token": "HTI Thanks You [????]" }`

## Running the game

- To run the game simply run: `npm start`

## The app

1. After checking the swagger doc I figured I needed to make a basic console app that asks a few questions (like a game menu without the actual game)
   1. Player name (bot name since we won't be playing ourselfses)
   2. Display a small game menu (Start, Reset player)
   3. Get a list of mazes <sup>_\*Excluding already played mazes_</sup>
   4. Run the maze after we selected it and print out our score for it
   5. Start from _ii._ after we finished it.
2. After I have made this simple version. Perhaps it's nice to display the bot's progress if we want (ask user) so we can discover the maze together.

## The plan.

1. Create a basic setup.
2. Asks all questions and just log answers.
3. Implement the api endpoints.
4. Implement a placeholder maze solver.
5. Remove logs and use endpoints and the maze solver.
6. Remove placeholder logic from maze solver and implement it.
7. Handle already in maze stuff and resetting user.

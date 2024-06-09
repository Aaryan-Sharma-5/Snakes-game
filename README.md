Objective: The primary goal is to control the snake, guiding it to eat food items that appear randomly on the board. Each time the snake eats food, it grows longer. The game continues until the snake collides with the walls or itself.
Controls: Use the arrow keys on your keyboard to change the direction of the snake:
  Arrow Up: Move up
  Arrow Down: Move down
  Arrow Left: Move left
  Arrow Right: Move right
Scoring: Each piece of food consumed increases the player's score by one point. The score is displayed on the screen along with the highest score achieved in previous sessions, which is stored locally on your device.
Sound Effects: The game includes sound effects for different actions:
  Eating food
  Changing direction
  Game over
Game Over: The game ends if the snake collides with the walls or its own body. A "Game Over" alert is displayed when the game ends, and a "Play Again" button appears, allowing players to restart the game and try to beat their high score.

How to Play - 
Start the Game: The game begins automatically when the page loads. The snake starts at a fixed position on the board.
Navigate the Snake: Use the arrow keys to guide the snake towards the food.
Eat Food: Each time the snake eats food, it grows longer, and a new piece of food appears randomly on the board.
Avoid Collisions: Prevent the snake from hitting the walls or its body to continue playing.
Game Over and Restart: If a collision occurs, a "Game Over" message will be displayed along with a "Play Again" button. Click the button to reset the game and start a new round.

Technical Details -
Dynamic Gameplay: The game board updates in real-time, and the snake moves continuously, requiring quick reflexes and strategic planning.
High Score Tracking: The highest score is saved and displayed, motivating players to improve their performance.
Sound Integration: Enhances the gaming experience with sound effects corresponding to different in-game actions.
Responsive Controls: Smooth and responsive controls ensure a seamless gaming experience.
Language: JavaScript for game logic, HTML5 for structure, and CSS for styling.
Canvas API: Utilizes the HTML5 Canvas API to render the game board and elements.
LocalStorage: Uses the browser's LocalStorage to save and retrieve the high score.
Audio: Incorporates audio files to play sound effects during the game.

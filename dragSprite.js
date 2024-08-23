const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 50;
const gridCols = 8;
const gridRows = 8;

let candySprites = []; // Array to hold candy sprite objects
let selectedCandy = null; // Track the selected candy
let secondSelectedCandy = null;
let isDragging = false;

// CandySprite constructor
function CandySprite(x, y, image) {
  this.x = x;
  this.y = y;
  this.image = image;
  this.isDragging = false;
  this.checked = false;
}

// Draw the candy sprite
CandySprite.prototype.draw = function() {
  ctx.drawImage(this.image, this.x, this.y, gridSize, gridSize);
};

// Initialize candy sprites
for (let i = 0; i < gridCols; i++) {
  candySprites.push([]);
  for (let j = 0; j < gridRows; j++) {
    const candyImage = new Image();
    candyImage.src = `_match01/part${Math.floor(Math.random() * 12) + 1}.png`;
    candySprites[i].push(new CandySprite(i * gridSize, j * gridSize, candyImage));
  }
}

// Draw grid lines and candies
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid lines (optional)
  ctx.beginPath();
  for (let i = 0; i <= gridCols; i++) {
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, gridRows * gridSize);
  }
  for (let i = 0; i <= gridRows; i++) {
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(gridCols * gridSize, i * gridSize);
  }
  ctx.stroke();
}

function drawCandies() {
  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      if (candySprites[i][j]) {
        candySprites[i][j].draw();
      }
    }
  }
}

function drawCandy() {
  drawGrid();
  drawCandies();
}

// Find candy at specific position
function findCandyAt(x, y) {
  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);
  if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
    return candySprites[col][row];
  }
  return null;
}

// Check if candies can be swapped
function canSwapCandies(candy1, candy2) {
  const dx = Math.abs(candy1.x - candy2.x);
  const dy = Math.abs(candy1.y - candy2.y);
  return (dx === gridSize && dy === 0) || (dx === 0 && dy === gridSize);
}

// Check for matches and handle matched candies
function checkForMatches() {
  const matchedCandies = [];

  function addMatch(candy) {
    if (!matchedCandies.includes(candy)) {
      matchedCandies.push(candy);
    }
  }

  // Check horizontal matches
  for (let row = 0; row < gridRows; row++) {
    let count = 1;
    for (let col = 0; col < gridCols - 1; col++) {
      if (candySprites[col][row].image.src === candySprites[col + 1][row].image.src) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            addMatch(candySprites[col - i][row]);
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let i = 0; i < count; i++) {
        addMatch(candySprites[gridCols - 1 - i][row]);
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < gridCols; col++) {
    let count = 1;
    for (let row = 0; row < gridRows - 1; row++) {
      if (candySprites[col][row].image.src === candySprites[col][row + 1].image.src) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            addMatch(candySprites[col][row - i]);
          }
        }
        count = 1;
      }
    }
    if (count >= 3) {
      for (let i = 0; i < count; i++) {
        addMatch(candySprites[col][gridRows - 1 - i]);
      }
    }
  }

  // Process matched candies
  if (matchedCandies.length > 0) {
    console.log('Matched candies:', matchedCandies);
    for (const candy of matchedCandies) {
      const col = Math.floor(candy.x / gridSize);
      const row = Math.floor(candy.y / gridSize);
      candySprites[col][row] = null; // Remove matched candy
    }
    updateGrid(); // Update grid after removing candies
    return true;
  }

  return false;
}

// Update grid after matches are removed
function updateGrid() {
  for (let col = 0; col < gridCols; col++) {
    let emptySpaces = 0;
    for (let row = gridRows - 1; row >= 0; row--) {
      if (candySprites[col][row] === null) {
        emptySpaces++;
      } else if (emptySpaces > 0) {
        candySprites[col][row + emptySpaces] = candySprites[col][row];
        candySprites[col][row + emptySpaces].y += emptySpaces * gridSize;
        candySprites[col][row] = null;
      }
    }
    
    // Create new candies at the top
    for (let i = 0; i < emptySpaces; i++) {
      const newCandyImage = new Image();
      newCandyImage.src = `_match01/part${Math.floor(Math.random() * 12) + 1}.png`;
      candySprites[col][i] = new CandySprite(col * gridSize, i * gridSize, newCandyImage);
    }
  }
}

// Swap candies function
function swapCandies(candy1, candy2) {
  const tempX = candy1.x;
  const tempY = candy1.y;
  candy1.x = candy2.x;
  candy1.y = candy2.y;
  candy2.x = tempX;
  candy2.y = tempY;
  
  const col1 = Math.floor(candy1.x / gridSize);
  const row1 = Math.floor(candy1.y / gridSize);
  const col2 = Math.floor(candy2.x / gridSize);
  const row2 = Math.floor(candy2.y / gridSize);
  
  [candySprites[col1][row1], candySprites[col2][row2]] = [candySprites[col2][row2], candySprites[col1][row1]];
  
  console.log('Swapped candies:', candy1, candy2);
}

// Handle candy selection and swapping
function handleCandySelection(x, y) {
  const clickedCandy = findCandyAt(x, y);
  
  if (clickedCandy) {
    if (!selectedCandy) {
      selectedCandy = clickedCandy;
    } else {
      if (canSwapCandies(selectedCandy, clickedCandy)) {
        swapCandies(selectedCandy, clickedCandy);
        if (!checkForMatches()) {
          // If no matches, swap back
          swapCandies(selectedCandy, clickedCandy);
        }
        selectedCandy = null;
      } else {
        selectedCandy = clickedCandy;
      }
    }
    drawCandy();
  }
}

// Event listeners
canvas.addEventListener('mousedown', (event) => {
  const mouseX = event.clientX - canvas.offsetLeft;
  const mouseY = event.clientY - canvas.offsetTop;
  handleCandySelection(mouseX, mouseY);
});

canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  const touch = event.touches[0];
  const touchX = touch.clientX - canvas.offsetLeft;
  const touchY = touch.clientY - canvas.offsetTop;
  handleCandySelection(touchX, touchY);
});

// Initialize the canvas
window.onload = function() {
  drawCandy();
};
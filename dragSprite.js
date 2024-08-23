const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 50;
const gridCols = 8;
const gridRows = 8;

let candySprites = []; // Array to hold candy sprite objects
let selectedCandy = null; // Track the selected candy
let secondSelectedCandy = null;
let clickedCandy = null;
let isDragging = false;

// CandySprite constructor
function CandySprite(x, y, image) {
  this.x = x;
  this.y = y;
  this.image = image;
  this.isDragging = false; // Added for tracking dragging status
}

// Draw the candy sprite
CandySprite.prototype.draw = function() {
  ctx.drawImage(this.image, this.x, this.y, gridSize, gridSize);
};

// Initialize candy sprites (replace with your candy images)
for (let i = 0; i < gridCols; i++) {
  candySprites.push([]);
  for (let j = 0; j < gridRows; j++) {
    const candyImage = new Image();
    candyImage.src = `_match01/part${Math.floor(Math.random() * 12) + 1}.png`; // Example candy images
    candySprites[i].push(new CandySprite(i * gridSize, j * gridSize, candyImage));
  }
}

// Draw grid lines and candies
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw grid lines (optional)
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
    let startCol = 0;
    while (startCol < gridCols) {
      const currentCandy = candySprites[startCol][row];
      if (currentCandy) {
        let endCol = startCol;
        while (endCol < gridCols && candySprites[endCol][row] && candySprites[endCol][row].image.src === currentCandy.image.src) {
          endCol++;
        }
        if (endCol - startCol >= 3) {
          for (let col = startCol; col < endCol; col++) {
            addMatch(candySprites[col][row]);
          }
        }
        startCol = endCol;
      } else {
        startCol++;
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < gridCols; col++) {
    let startRow = 0;
    while (startRow < gridRows) {
      const currentCandy = candySprites[col][startRow];
      if (currentCandy) {
        let endRow = startRow;
        while (endRow < gridRows && candySprites[col][endRow] && candySprites[col][endRow].image.src === currentCandy.image.src) {
          endRow++;
        }
        if (endRow - startRow >= 3) {
          for (let row = startRow; row < endRow; row++) {
            addMatch(candySprites[col][row]);
          }
        }
        startRow = endRow;
      } else {
        startRow++;
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
  }
}

// Update grid after matches are removed
function updateGrid() {
  for (let col = 0; col < gridCols; col++) {
    for (let row = gridRows - 1; row >= 0; row--) {
      if (candySprites[col][row] === null) {
        // Move candies down
        for (let r = row - 1; r >= 0; r--) {
          if (candySprites[col][r] !== null) {
            candySprites[col][r].y += gridSize;
            candySprites[col][r + 1] = candySprites[col][r];
            candySprites[col][r] = null;
          }
        }
        // Create new candy at the top
        const newCandyImage = new Image();
        newCandyImage.src = `_match01/part${Math.floor(Math.random() * 12) + 1}.png`;
        candySprites[col][0] = new CandySprite(col * gridSize, 0, newCandyImage);
      }
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
  console.log('Swapped candies:', candy1, candy2);
}

if ('ontouchstart' in window){
  canvas.addEventListener('ontouchstart', (event) => { 
    const mouseY = event.clientY - canvas.offsetTop;
  
    selectedCandy = findCandyAt(mouseX, mouseY);
    if (selectedCandy) {
      selectedCandy.isDragging = true;
      console.log('mousedown:', selectedCandy, mouseX, mouseY);
      isDragging = true;
    }
  });
  canvas.addEventListener('ontouchmove', (event) => {  
    console.log('mousemove:', selectedCandy);
    let newX = event.clientX - canvas.offsetLeft - gridSize / 2;
    let newY = event.clientY - canvas.offsetTop - gridSize / 2;

    // Constrain the sprite within the grid
    newX = Math.max(0, Math.min(newX, (gridCols - 1) * gridSize));
    newY = Math.max(0, Math.min(newY, (gridRows - 1) * gridSize));

    selectedCandy.x = newX;
    selectedCandy.y = newY;
    drawCandy();
    
  });
  canvas.addEventListener('ontouchend', (event) => { 
    selectedCandy.isDragging = false;
    isDragging = false;
    console.log('mouseup:', selectedCandy);

    if (clickedCandy && canSwapCandies(selectedCandy, clickedCandy)) {
      console.log('Swapping candies:', selectedCandy, clickedCandy);
      secondSelectedCandy = clickedCandy;
      swapCandies(selectedCandy, secondSelectedCandy);
      checkForMatches();
    }
    selectedCandy = null;
    secondSelectedCandy = null;

    drawCandy();
  });

}else{
  canvas.addEventListener('mousedown', (event) => {const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
  
    selectedCandy = findCandyAt(mouseX, mouseY);
    if (selectedCandy) {
      selectedCandy.isDragging = true;
      console.log('mousedown:', selectedCandy, mouseX, mouseY);
      isDragging = true;
    } else {
      console.log('No candy selected at mousedown:', mouseX, mouseY);
    }
  });

  canvas.addEventListener('mouseup', (event) => { if (isDragging && selectedCandy) {
    selectedCandy.isDragging = false;
    isDragging = false;
    console.log('mouseup:', selectedCandy);

    if (clickedCandy && canSwapCandies(selectedCandy, clickedCandy)) {
      console.log('Swapping candies:', selectedCandy, clickedCandy);
      secondSelectedCandy = clickedCandy;
      swapCandies(selectedCandy, secondSelectedCandy);
      checkForMatches();
    }
    selectedCandy = null;
    secondSelectedCandy = null;
  } else {
    console.log('No candy selected at mouseup:', selectedCandy);
  }
  drawCandy();
});

  canvas.addEventListener('mousemove', (event) => {   if (isDragging && selectedCandy) {
    console.log('mousemove:', selectedCandy);
    let newX = event.clientX - canvas.offsetLeft - gridSize / 2;
    let newY = event.clientY - canvas.offsetTop - gridSize / 2;

    // Constrain the sprite within the grid
    newX = Math.max(0, Math.min(newX, (gridCols - 1) * gridSize));
    newY = Math.max(0, Math.min(newY, (gridRows - 1) * gridSize));

    selectedCandy.x = newX;
    selectedCandy.y = newY;
    drawCandy();
  } else {
    console.log('No candy being dragged at mousemove:', selectedCandy);
  }
});
}

// Initialize the canvas
window.onload = function() {
  drawCandy();
};

let data;
let dates = [];
let sleepData = [];
let readinessData = [];
let heartRateData = [];
let memeImageLow;  // Meme for low readiness score
let memeImageHigh; // Meme for high readiness score
let index = 0;
let leftPadding = 80; // Added padding on the left side
let memeVisibleCounter = 0; // Counter to control meme visibility

function preload() {
  // Load the CSV file
  data = loadTable('oura_fully_cleaned_data.csv', 'csv', 'header');
  // Load the meme images
  memeImageLow = loadImage('884ce109411dc5b77a7bfe0b62eb1337.jpg');
  memeImageHigh = loadImage('optimalday.jpg');
}

function setup() {
  createCanvas(880, 400); // Increased width to accommodate left padding
  frameRate(2); // Slow down the animation speed
  background(0);
  noSmooth();

  // Extract data from the CSV
  for (let i = 0; i < data.getRowCount(); i++) {
    dates.push(data.getString(i, 'date'));
    sleepData.push(data.getNum(i, 'minutes_sleep_day_prior')); // Use sleep data as is (in hours)
    readinessData.push(data.getNum(i, 'readiness_score'));
    heartRateData.push(data.getNum(i, 'average_heart_rate')); // Extract heart rate data
  }
  
  
}

function draw() {
  background(0);

  // Date Display
  push();
  textSize(16);
  textStyle(NORMAL);
  fill(255);  // Set to white
  textAlign(LEFT);
  text("Date: " + dates[index], leftPadding, 30);
  pop();

  // Draw radial pulse animation based on heart rate
  drawRadialPulse();

  // Draw readiness rating guidelines
  drawReadinessGuidelines();

  // Draw Sleep Duration Line
  push();
  stroke(255);  // Set stroke to white
  strokeWeight(2);
  for (let i = 0; i < index; i++) {
    let x1 = map(i, 0, dates.length - 1, leftPadding + 50, width - 50);
    let y1 = map(sleepData[i], 6, 10, height / 2 + 20, height / 2 - 60);
    let x2 = map(i + 1, 0, dates.length - 1, leftPadding + 50, width - 50);
    let y2 = map(sleepData[i + 1], 6, 10, height / 2 + 20, height / 2 - 60);
    line(x1, y1, x2, y2);
  }
  pop();

  // Draw Readiness Score Line
  push();
  stroke(255, 255, 0);  // Set stroke to yellow
  strokeWeight(2);
  for (let i = 0; i < index; i++) {
    let x1 = map(i, 0, dates.length - 1, leftPadding + 50, width - 50);
    let y1 = map(readinessData[i], 70, 100, height / 2 + 20, height / 2 - 60);
    let x2 = map(i + 1, 0, dates.length - 1, leftPadding + 50, width - 50);
    let y2 = map(readinessData[i + 1], 70, 100, height / 2 + 20, height / 2 - 60);
    line(x1, y1, x2, y2);
  }
  pop();

  // Display appropriate meme based on readiness score
  let memeWidth = 150;
  let memeHeight = 120;
  let memeX = (width - memeWidth) / 2; // Centered horizontally
  let memeY = 10; // Positioned near the top, but below the date text

  if (readinessData[index] < 60) {
    image(memeImageLow, memeX, memeY, memeWidth, memeHeight); // Adjust the position and size of the meme
    memeVisibleCounter = 4; // Set counter to keep meme visible for 4 frames (2 seconds)
  } else if (readinessData[index] >= 85) {
    image(memeImageHigh, memeX, memeY, memeWidth, memeHeight); // Centered at the top without blocking anything
    memeVisibleCounter = 4; // Set counter to keep meme visible for 4 frames (2 seconds)
  }

  // Display the meme if the counter is active
  if (memeVisibleCounter > 0) {
    if (readinessData[index] < 60) {
      image(memeImageLow, memeX, memeY, memeWidth, memeHeight); // Keep low readiness meme visible
    } else if (readinessData[index] >= 85) {
      image(memeImageHigh, memeX, memeY, memeWidth, memeHeight); // Keep high readiness meme visible
    }
    memeVisibleCounter--;
  }

  // Sleep Duration Label
  push();
  textSize(16);
  textStyle(NORMAL);
  fill(255);  // Set to white
  textAlign(LEFT);
  text("Sleep Time In Hours: " + nf(sleepData[index], 1, 2) + " hrs", leftPadding, height - 40);
  pop();

  // Readiness Score Label
  push();
  textSize(16);
  textStyle(NORMAL);
  fill(255, 255, 0);  // Set to yellow
  textAlign(LEFT);
  text("Readiness Score: " + readinessData[index] + " (" + getReadinessRating(readinessData[index]) + ")", leftPadding, height - 20);
  pop();

  // Footer Text
  push();
  textSize(12);
  textStyle(NORMAL);
  fill(200);  // Set to light grey
  textAlign(RIGHT, BOTTOM);
  text("Source: Oura Ring 🤍", width - 10, height - 10);
  pop();

  index++;
  if (index >= dates.length) {
    index = dates.length - 1;
  }
}

function drawRadialPulse() {
  let pulseRadius = map(heartRateData[index], 40, 100, 20, 60); // Map heart rate to a radius
  let pulseOpacity = map(sin(frameCount * 0.1), -1, 1, 100, 255); // Pulsing effect based on sine wave

  // Draw the heart pulse
  push();
  translate(width - 100, height / 2);
  fill(255, 0, 0, pulseOpacity);
  noStroke();
  drawHeart(0, 0, pulseRadius);

  // Display the BPM number next to the heart animation
  fill(255);  // Set to white
  textSize(16);
  textAlign(CENTER, CENTER);
  text(heartRateData[index] + " BPM", 0, pulseRadius + 20); // Positioned below the pulse
  pop();
}

function drawHeart(x, y, size) {
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
}

function drawReadinessGuidelines() {
  stroke(100);
  strokeWeight(1);
  drawingContext.setLineDash([5, 5]);  // Dotted line pattern

  push();
  textSize(12);
  textStyle(NORMAL);

  // Pay Attention (0-59)
  let yPayAttention = map(59, 70, 100, height / 2 + 20, height / 2 - 60);
  line(leftPadding + 50, yPayAttention, width - 50, yPayAttention);
  fill(100);  // Set to guideline color
  textAlign(RIGHT, CENTER);
  text("Pay Attention", leftPadding + 40, yPayAttention);

  // Fair (60-69)
  let yFair = map(69, 70, 100, height / 2 + 20, height / 2 - 60);
  stroke(150);
  drawingContext.setLineDash([5, 5]);
  line(leftPadding + 50, yFair, width - 50, yFair);
  fill(150);  // Set to guideline color
  text("Fair", leftPadding + 40, yFair);

  // Good (70-84)
  let yGood = map(84, 70, 100, height / 2 + 20, height / 2 - 60);
  stroke(200);
  drawingContext.setLineDash([5, 5]);
  line(leftPadding + 50, yGood, width - 50, yGood);
  fill(200);  // Set to guideline color
  text("Good", leftPadding + 40, yGood);

  // Optimal (85-100)
  let yOptimal = map(100, 70, 100, height / 2 + 20, height / 2 - 60);
  stroke(255);
  drawingContext.setLineDash([5, 5]);
  line(leftPadding + 50, yOptimal, width - 50, yOptimal);
  fill(255);  // Set to guideline color
  text("Optimal", leftPadding + 40, yOptimal);

  pop();
  drawingContext.setLineDash([]); // Reset line pattern to solid
}

function getReadinessRating(score) {
  if (score >= 85) {
    return "Optimal";
  } else if (score >= 70) {
    return "Good";
  } else if (score >= 60) {
    return "Fair";
  } else {
    return "Pay Attention";
  }
}


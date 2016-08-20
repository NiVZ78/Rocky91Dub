var rocky = require('rocky');

// Create a JS GPoint object
function GPoint(x, y) {
    return { x:x, y:y };
}


// Create a JS GRect object
function GRect(x, y, w, h) {
    return {
        origin : {x:x, y:y },
        size   : {w:w, h:h }
    };

}

// Convenience function to draw a filled rounded rect
// Draws 4 circles at each corner
// Then fills the 3 spaces with rectangles
function fill_round_rect(ctx, rect, corner_radius){
 
  // Draw top left corner
  ctx.rockyFillRadial(rect.origin.x + corner_radius, rect.origin.y + corner_radius, corner_radius, 0.1, 0, 2 * Math.PI);
  
  // Draw top middle rect
  ctx.fillRect(rect.origin.x + corner_radius, rect.origin.y, rect.size.w - (corner_radius*2), corner_radius*2);
 
  // Draw top right corner
  ctx.rockyFillRadial(rect.origin.x + rect.size.w - corner_radius, rect.origin.y + corner_radius, corner_radius, 0.1, 0, 2 * Math.PI);
  
  // Draw middle rect
  ctx.fillRect(rect.origin.x, rect.origin.y + corner_radius, rect.size.w, rect.size.h - (corner_radius*2));
  
  // Draw bottom left corner
  ctx.rockyFillRadial(rect.origin.x + corner_radius, rect.origin.y + rect.size.h - corner_radius, corner_radius, 0.1, 0, 2 * Math.PI);
  
  // Draw bottom middle rect
  ctx.fillRect(rect.origin.x + corner_radius, rect.origin.y + rect.size.h - (corner_radius*2), rect.size.w - (corner_radius*2), corner_radius*2);
  
  // Draw bottom right corner
  ctx.rockyFillRadial(rect.origin.x + rect.size.w - corner_radius, rect.origin.y + rect.size.h - corner_radius, corner_radius, 0.1, 0, 2 * Math.PI);
  
}


// Bitmask for the 7 segment LCD digits to make describing the shapes easier
var segTop = 1;
var segTopRight = 2;
var segBottomRight = 4;
var segBottom = 8;
var segBottomLeft = 16;
var segTopLeft = 32;
var segMiddle = 64;

// Array describing which LCD segments should be 'lit' for each number
var lcdDigits = [
  segTop + segTopLeft + segTopRight + segBottomLeft + segBottomRight + segBottom,
  segTopRight + segBottomRight,
  segTop + segTopRight + segMiddle + segBottomLeft + segBottom,
  segTop + segTopRight + segMiddle + segBottomRight + segBottom,
  segTopLeft + segMiddle + segTopRight + segBottomRight,
  segTop + segTopLeft + segMiddle + segBottomRight + segBottom,
  segTop + segTopLeft + segMiddle + segBottomLeft + segBottomRight + segBottom,
  segTop + segTopRight + segBottomRight,
  segTop + segTopLeft + segTopRight + segMiddle + segBottomLeft + segBottomRight + segBottom,
  segTop + segTopLeft + segTopRight + segMiddle + segBottomRight + segBottom
]; 



function draw_lcd_digit(ctx, d, x, y, w, h, sw){
  
  // Top segment
  if (lcdDigits[d] & segTop){
    ctx.beginPath();
    ctx.moveTo(x+1, y);
    ctx.lineTo(x+w-2, y);
    ctx.lineTo(x+w-sw-1, y+sw-1);
    ctx.lineTo(x+sw, y+sw-1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  // Top Right
  if (lcdDigits[d] & segTopRight){
    ctx.beginPath();
    ctx.moveTo(x+w-1, y+1);
    ctx.lineTo(x+w-1, y+(h/2)-2);
    ctx.lineTo(x+w-sw, y+(h/2)-sw-1);
    ctx.lineTo(x+w-sw, y+sw);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  
  // Bottom Right
  if (lcdDigits[d] & segBottomRight){
    ctx.beginPath();
    ctx.moveTo(x+w-1, y+(h/2)+1);
    ctx.lineTo(x+w-1, y+h-2);
    ctx.lineTo(x+w-sw, y+h-sw-1);
    ctx.lineTo(x+w-sw, y+(h/2)+sw);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  
  // Bottom
  if (lcdDigits[d] & segBottom){
    ctx.beginPath();
    ctx.moveTo(x+1, y+h-1);
    ctx.lineTo(x+sw, y+h-sw);
    ctx.lineTo(x+w-sw-1, y+h-sw);
    ctx.lineTo(x+w-2, y+h-1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  
  // Bottom Left
  if (lcdDigits[d] & segBottomLeft){
    ctx.beginPath();
    ctx.moveTo(x, y+(h/2)+1);
    ctx.lineTo(x+sw-1, y+(h/2)+sw);
    ctx.lineTo(x+sw-1, y+h-sw-1);
    ctx.lineTo(x, y+h-2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  
  // Top Left
  if (lcdDigits[d] & segTopLeft){
    ctx.beginPath();
    ctx.moveTo(x, y+1);
    ctx.lineTo(x+sw-1, y+sw);
    ctx.lineTo(x+sw-1, y+(h/2)-sw-1);
    ctx.lineTo(x, y+(h/2)-2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();  
  }

  // Middle
  if (lcdDigits[d] & segMiddle){
    ctx.beginPath();
    ctx.moveTo(x+1, y+(h/2));
    ctx.lineTo(x+(sw/2), y+(h/2)-(sw/2));
    ctx.lineTo(x+w-sw+1, y+(h/2)-(sw/2));
    ctx.lineTo(x+w-2, y+(h/2));
    ctx.lineTo(x+w-sw+1, y+(h/2)+(sw/2)-1);
    ctx.lineTo(x+(sw/2), y+(h/2)+(sw/2)-1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}



// Main update/draw
rocky.on('draw', function(event) {
  
  // Get the canvas context
  var ctx = event.context;
  
  // Get screen width & height
  var width  = ctx.canvas.clientWidth;
  var height = ctx.canvas.clientHeight;
  
  // Sorry Heiko
  var is_round = false;
  if (width == 180){ is_round = true;}
  
  // Get the center of the screen
  var center = GPoint(width/2, height/2);
  
  // Clear the screen
  ctx.clearRect(0, 0, width, height);
  
  // Draw the circles or round rects to make up the outer border and LCD background
  ctx.fillStyle = '#ffffff';
  if (is_round){
    ctx.rockyFillRadial(center.x, center.y, 78, 0.1, 0, 2 * Math.PI);
  }
  else{
    fill_round_rect(ctx, GRect(center.x-67, center.y-50, 133, 102), 10);
  }

  ctx.fillStyle = '#000000';
  if (is_round){
    ctx.rockyFillRadial(center.x, center.y, 76, 0.1, 0, 2 * Math.PI);
  }
  else{
    fill_round_rect(ctx, GRect(center.x-65, center.y-48, 129, 98), 8);
  }
  
  ctx.fillStyle = '#ffffff';
  if (is_round){
    ctx.rockyFillRadial(center.x, center.y, 74, 0.1, 0, 2 * Math.PI);
  }
  else{
    fill_round_rect(ctx, GRect(center.x-63, center.y-46, 125, 94), 6);
  }
  
  // Set the fill and stroke color for the LCD digits
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  
  // Get the date & time
  var d = new Date();
  var tm_hour = d.getHours();
  var tm_min = d.getMinutes();
  var tm_sec = d.getSeconds();
  
  
  // HOURS
  draw_lcd_digit(ctx, Math.floor(tm_hour/10), center.x-61, center.y-8, 20, 32, 5);
  draw_lcd_digit(ctx, Math.floor(tm_hour%10), center.x-37, center.y-8, 20, 32, 5);
  
  // Separator
  ctx.fillRect(center.x-15, center.y-3, 5, 5);
  ctx.fillRect(center.x-15, center.y+18, 5, 5);
  
  // MINUTES
  draw_lcd_digit(ctx, Math.floor(tm_min/10), center.x-7, center.y-8, 20, 32, 5);
  draw_lcd_digit(ctx, Math.floor(tm_min%10), center.x+15, center.y-8, 20, 32, 5);
  
  // SECONDS
  draw_lcd_digit(ctx, Math.floor(tm_sec/10), center.x+37, center.y+8, 10, 16, 2);
  draw_lcd_digit(ctx, Math.floor(tm_sec%10), center.x+49, center.y+8, 10, 16, 2);
  
});


rocky.on('secondchange', function(event) {

  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
  
});

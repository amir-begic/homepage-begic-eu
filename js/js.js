function draw() {
    
    requestAnimationFrame(draw)
    ctx.fillStyle = '#004494';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight); 

    drawBoxes()
    drawLines()
    spinBoxes()

}

function drawLines(){
    let onePercentX = window.innerWidth/100;
    let sectionCount = 5;
    let linedistanceX = 100 / sectionCount;
    let linepositionX = linedistanceX;

    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = "white";

    for (i = 0; i < sectionCount ;i++){
        ctx.moveTo(onePercentX * linepositionX, 0);
        ctx.lineTo(onePercentX * linepositionX, window.innerHeight);
        linepositionX += linedistanceX;
    }
    ctx.stroke();
}


function drawBoxes(){
    let onePercentX = window.innerWidth/100;
    let boxCount = 5;
    let xPos = 0;
    let xOffset = 100 / boxCount;
    let boxHeight = window.innerHeight/32;
    let boxWidth = window.innerWidth/5;

    ctx.fillStyle = '#aeae93';
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    padding = 2;

    for (i=0; i < boxCount;i++){
        let x = onePercentX*xPos;
        let y = offsetY[i];

        ctx.fillStyle = '#aeae93';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        
        ctx.fillStyle = 'white';        
        ctx.fillText(textElements[i], x + boxWidth / 2 +  padding, y + padding + boxHeight/ 2);
        xPos += xOffset;
    }
}

function spinBoxes(){
    for (i = 0; i < 5; i++){ 
        TweenMax.to(tweenElement[i], tweenDuration[i], {y: window.innerHeight * 7.5, onComplete: drawStars });
        offsetY[i] = tweenElement[i].y > (window.innerHeight*Math.floor(tweenElement[i].y/window.innerHeight)) ? 
            tweenElement[i].y - (window.innerHeight*Math.floor(tweenElement[i].y/window.innerHeight)) : tweenElement[i].y
    }
    

}

function drawStars(){
    console.log("go")
}

var reset = false;
var textElements = ['Amir', 'Begic', 'Starcraft', 'Warhammer', 'Civilization'];
var initialOffset = 0;
var tweenDuration = [3, 4, 5.4, 5, 3.6];
var offsetY = [initialOffset, initialOffset, initialOffset, initialOffset, initialOffset];
var offsetYtween = {y: 0};
var tweenElement = [{y:0},{y:0},{y:0},{y:0},{y:0}];

var canvas = document.querySelector('#canvas');
canvas.style.width = window.innerWidth;
canvas.width= window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.height = window.innerHeight;
if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
}
draw()
  
window.addEventListener('resize', ()=>{
    canvas.style.width = window.innerWidth;
    canvas.width= window.innerWidth;
    canvas.height= window.innerHeight;
    canvas.style.height = window.innerHeight;
})
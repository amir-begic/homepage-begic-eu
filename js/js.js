function draw() {
    
    ctx.fillStyle = '#004494';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    time += 0.5;
    drawLines();
    drawStars(time);
    drawBoxes();
    spinBoxes();
    requestAnimationFrame(draw);
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

    // for(i = 0; i>11; i++){
    //     drawStarsInACircle()
    // }

    // ctx.drawImage(imgStar, onePercentX*45 - 30, window.innerHeight/100*22 -30, 60, 60);
    // ctx.drawImage(imgStar, onePercentX*50 - 30, window.innerHeight/100*20 -30, 60, 60);

}

function drawBoxes(){
    let onePercentX = window.innerWidth/100;
    let boxCount = 5;
    let xPos = 0;
    let xOffset = 100 / boxCount;
    let boxHeight = window.innerHeight/32;
    let boxWidth = window.innerWidth/5;

    ctx.fillStyle = '#aeae93';
    ctx.font = "19px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    padding = 2;

    for (i=0; i < boxCount;i++){
        let x = onePercentX*xPos;
        let y = offsetY[i];

        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        
        ctx.fillStyle = 'black';        
        ctx.fillText(textElements[i], x + boxWidth / 2 +  padding, y + padding + boxHeight / 2);
        xPos += xOffset;
    }
}

function spinBoxes(){
    for (i = 0; i < textElements.length; i++){ 
        TweenMax.to(tweenElement[i], tweenDuration[i], {y: window.innerHeight *10.5, onComplete: drawStars });
        //TODO: Add Custom tween, last couple of values linger too long
        offsetY[i] = tweenElement[i].y - (window.innerHeight * Math.floor(tweenElement[i].y/window.innerHeight));
    }  
}

function drawStars(time){
    radiants.forEach(radiant => positionStars(radiant + time));
}

function positionStars(radiant){
    var radius = window.innerHeight *0.4;
    if (window.innerHeight > window.innerWidth){
        radius = window.innerHeight * 0.1;
    }
    var x = Math.cos(radiant/180*Math.PI ) * radius;
    var y = Math.sin(radiant/180*Math.PI ) * radius;
    ctx.drawImage(imgStar, window.innerWidth / 2 + x - 30, window.innerHeight / 2 + y -30, 60, 60);
    
}

const imgStar = new Image(50,50);
imgStar.src = 'assets/star.png'

var time = 0;
var radiants = [0,30,60,90,120,150,180,210,240,270,300,330];
var textElements = ['Amir', 'Begic', 'LTT', 'Store', '.Com'];
var initialOffset = 0;
var tweenDuration = [2, 3, 3.35, 3.3, 2.6];
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
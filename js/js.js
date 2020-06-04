function draw() {
    
    ctx.fillStyle = '#004494';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    if(scrollClockwise){
        if(timeOffset > 0.5 )
        {
            timeOffset -= 0.2
        }else{
            timeOffset += 0.2
        }
    }else{
        if(timeOffset < -0.5)
        {
            timeOffset += 0.2
        }else{
            timeOffset -= 0.2
        }
    }

    time += timeOffset;

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
}

function drawBoxes(){
    let onePercentX = window.innerWidth/100;
    let boxCount = 5;
    let xPos = 0;
    let xOffset = 100 / boxCount;
    let boxHeight = window.innerHeight/32;
    let boxWidth = window.innerWidth/5;

    ctx.fillStyle = '#aeae93';
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    padding = 2;

    if (window.innerHeight > window.innerWidth){
        ctx.font = "14px Arial";        
        padding = 1;
    }

    for (i=0; i < boxCount;i++){
        let x = onePercentX*xPos;
        let y = offsetY[i];
        textElements[4] = moment().format('HH:mm:ss');
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        
        ctx.fillStyle = 'black';        
        ctx.fillText(textElements[i], x + boxWidth / 2 +  padding, y  + boxHeight / 2 + padding);
        xPos += xOffset;
    }
}

function spinBoxes(){
    for (i = 0; i < textElements.length; i++){ 
        CustomEase.create("custom", "M0,0 C0.12,0.364 -0.184,1.028 0.921,0.996 0.933,0.998 0.946,1 0.958,1 0.978,1 0.942,1 1,1 ");
        TweenMax.to(tweenElement[i], tweenDuration[i], {y: window.innerHeight *10.48, ease: "custom"})
        offsetY[i] = tweenElement[i].y - (window.innerHeight * Math.floor(tweenElement[i].y/window.innerHeight));
    }  
}

function drawStars(time){
    radiants.forEach(radiant => positionStars(radiant + time));
}

function positionStars(radiant){
    var radius = window.innerHeight *0.4;
    var yOffset = 30;
    var imageSize = 60;
    if (window.innerHeight > window.innerWidth){
        radius = window.innerHeight * 0.2;
        yOffset= 10;
        imageSize = 20;
    }
    var x = Math.cos(radiant/180*Math.PI ) * radius;
    var y = Math.sin(radiant/180*Math.PI ) * radius;
    ctx.drawImage(imgStar, window.innerWidth / 2 + x - imageSize / 2, window.innerHeight / 2 + y - yOffset, 
        imageSize, imageSize);
    
}

const imgStar = new Image(50,50);
imgStar.src = 'assets/star.png'

var scrollClockwise = true;
var time = 0;
var timeOffset = 0.5
var radiants = [0,30,60,90,120,150,180,210,240,270,300,330];
var textElements = ['Amir', 'Begic', 'WebDev', 'Student', String.fromCharCode(169)+"2020"];
var initialOffset = 0;
var tweenDuration = [2, 2.3, 2.45, 2.43, 2.4];
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

window.addEventListener('wheel', (event)=>{

    if(event.deltaY < 0 && timeOffset > -10){
        timeOffset -= 1.5;        
    }else if (event.deltaY > 0 && timeOffset < 10){
        timeOffset += 1.5;
    }

    scrollClockwise = timeOffset > 0;
});

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
    drawWhiteOverlay();
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

    for (i = 1; i < sectionCount; i++){
        ctx.moveTo(onePercentX * linepositionX, 0);
        ctx.lineTo(onePercentX * linepositionX, window.innerHeight);
        linepositionX += linedistanceX;
    }

    ctx.stroke();
}

function drawBoxes(){
    let onePercentX = window.innerWidth/100;
    let xPos = 0;
    let xOffset = 100 / boxCount;

    ctx.fillStyle = '#aeae93';
    ctx.font = "28px eurocine-regular";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    padding = 2;

    if (window.innerHeight > window.innerWidth){
        ctx.font = "10px eurocine-regular";        
        padding = 0;
    }

    for (i=0; i < boxCount;i++){   
        let x = onePercentX*xPos;
        let y = offsetY[i];
        textElements[4] = moment().format('HH:mm:ss');
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, boxWidth, boxHeights[i]);
        
        ctx.fillStyle = 'black';        
        ctx.fillText(textElements[i], x + boxWidth / 2 +  padding, y  + boxHeights[i] / 2 + padding);
        xPos += xOffset;
    }
}

function spinBoxes(){
    for (i = 0; i < textElements.length; i++){ 
        CustomEase.create("custom", "M0,0,C0.104,0.204,0.126,0.564,1,1")
        if (boxHovered[i] == true){
            TweenMax.to(tweenElement[i], tweenDuration[i], {y: window.innerHeight * 9.9, ease: "custom"})
        }
        TweenMax.to(tweenElement[i], tweenDuration[i], {y: window.innerHeight * 9.97, ease: "custom"})
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

function drawWhiteOverlay(){
    
}

const imgStar = new Image(50,50);
imgStar.src = 'assets/star.png';

var canvas = document.querySelector('#canvas');
var main = document.querySelector('#main');
var spinbutton = document.querySelector('#spinbutton');

var scrollClockwise = true;
var time = 0;
var timeOffset = 0.5
var radiants = [0,30,60,90,120,150,180,210,240,270,300,330];

var boxCount = 5;
var textElements = ['Amir', 'Begic', 'Projects', 'Photography', String.fromCharCode(169)+"2021"];
var initialOffset = 0;
var tweenDuration = [2, 2.8, 2.85, 2.6, 2.2];
var offsetY = [initialOffset, initialOffset, initialOffset, initialOffset, initialOffset];
var tweenElement = [{y:0},{y:0},{y:0},{y:0},{y:0}];

var initialBoxHeight = window.innerHeight/32;
var boxHeights = [initialBoxHeight, initialBoxHeight, initialBoxHeight, initialBoxHeight, initialBoxHeight];
var boxWidth = window.innerWidth/5;

var boxHovered = [false,false,false,false,false]


var pr = window.devicePixelRatio;
canvas.style.width = window.innerWidth;
canvas.width = Math.floor(window.innerWidth * pr);
canvas.height = Math.floor(window.innerHeight * pr);
canvas.style.height = window.innerHeight;

if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
}

ctx.scale(pr, pr);
draw();

window.addEventListener('resize', ()=>{
    canvas.style.width = window.innerWidth;
    canvas.width= Math.floor(window.innerWidth * pr);
    canvas.height =Math.floor(window.innerHeight * pr);
    canvas.style.height = window.innerHeight;
    ctx.scale(pr, pr);
})

canvas.addEventListener('click', (event)=> {
    var mousePositionX = event.clientX;
    var partition = Math.floor(5 / window.innerWidth * mousePositionX);

    boxHovered[partition] = true;
    drawWhiteOverlay(partition);
})

canvas.addEventListener('mousemove', (event)=>{
    boxHovered.fill(false);
    boxHeights.fill(initialBoxHeight);

    var mousePositionX = event.clientX;
    var partition = Math.floor(5 / window.innerWidth * mousePositionX);

    boxHovered[partition] = true;
})

canvas.addEventListener('mouseleave', (event)=>{
    boxHovered.fill(false);
})

spinbutton.addEventListener('click', ()=> {
    tweenElement = [{y:0},{y:0},{y:0},{y:0},{y:0}];
})

window.addEventListener('wheel', (event)=>{
    if(event.deltaY < 0 && timeOffset > -10){
        timeOffset -= 1.5;        
    }else if (event.deltaY > 0 && timeOffset < 10){
        timeOffset += 1.5;
    }
    scrollClockwise = timeOffset > 0;
});

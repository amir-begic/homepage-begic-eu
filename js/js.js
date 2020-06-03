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
        TweenMax.to(tweenElement[i], tweenDuration[i], {y: window.innerHeight *10.5})
        //TODO: Add Custom tween, last couple of values linger too long
        //CustomEase.create("custom", "M0,0,C0.126,0.382,0.728,1,0.98,1,1.168,1,0.818,1.001,1,1"), });
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
        yOffset= 0;
        imageSize = 30;
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
var textElements = ['Amir', 'Begic', 'Tab1', 'Tab2', 'Tab3'];
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

// DeviceOrientationEvent.requestPermission()
// .then(response => {
//   if (response == 'granted') {
    // window.addEventListener('deviceorientation', (event) => {
    //     if(event.beta < 0 && timeOffset > -10){
    //         timeOffset -= 0.8;        
    //     }else if (event.beta > 0 && timeOffset < 10){
    //         timeOffset += 0.8;
    //     }
    // console.log(event.beta)
    // })
//   }
// })
// .catch(console.error)

window.onload = function () {

    // Check if is IOS 13 when page loads.
    if ( window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function' ){
  
        // Everything here is just a lazy banner. You can do the banner your way.
        const banner = document.createElement('div')
        banner.innerHTML = `<div style="z-index: 1; position: absolute; width: 100%; background-color:#000; color: #fff"><p style="padding: 10px">Click here to enable DeviceMotion</p></div>`
        banner.onclick = ClickRequestDeviceMotionEvent // You NEED to bind the function into a onClick event. An artificial 'onClick' will NOT work.
        document.querySelector('body').appendChild(banner)
    }
  }
  
  
  function ClickRequestDeviceMotionEvent () {
    window.DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('devicemotion',
            () => { console.log('DeviceMotion permissions granted.') },
            (e) => { throw e }
        )} else {
          console.log('DeviceMotion permissions not granted.')
        }
      })
      .catch(e => {
        console.error(e)
      })
  }
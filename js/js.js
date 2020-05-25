
function draw() {
    ctx.fillStyle = '#004494';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight); 
    drawLines()
    //drawStar()
    drawText()
    requestAnimationFrame(draw)
}

function drawLines(){
    let onePercentX = window.innerWidth/100;
    let sectionCount = 5;
    let linedistanceX = 100 / sectionCount;
    let linepositionX = linedistanceX;
    ctx.beginPath();

    for(i = 0; i < sectionCount ;i++){
        ctx.moveTo(onePercentX * linepositionX, 0);
        ctx.lineWidth = "2";
        ctx.strokeStyle = "white";
        ctx.lineTo(onePercentX * linepositionX, window.innerHeight);
        linepositionX += linedistanceX;
    }
    ctx.stroke();
}

function drawText(){
    let initialPosition = 200

    ctx.font = "80px Arial";
    ctx.fillStyle = "white"
    if (initial){
        ctx.fillText("Hello World", 300, 200 + (offset1 / 2));
    }

    if (offset1 > -20 && !initial){
        //console.log(1)
        ctx.fillText("Hello World", 300, 0 + (offset1 / 2));
    }
    // if (offset2 > -20 && !initial){
    //     //console.log(2)
    //     ctx.fillText("Hello World", 300, 0 + offset2);
    // }


}
var initial = true
var offset1 = 0
var offset2 = 0
var canvas = document.querySelector('#canvas');
canvas.style.width = window.innerWidth;
canvas.width= window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.height = window.innerHeight;
if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
}

draw()

this.canvas.addEventListener('wheel',function(event){
    //mouseController.wheel(event);
    offset1 += event.deltaY    
    offset2 += event.deltaY


    if (offset1 > canvas.height + 60 )  
    {
        offset1 = 0;
        initial = false;
    }
    if (offset1 < 0){
        
        offset1 = canvas.height - 20;
    }

    if (offset1 < 0){
        
        offset1 = canvas.height - 20;
    }

    
    console.log(offset1)
    return false; 
}, false)

window.addEventListener('resize', ()=>{
    canvas.style.width = window.innerWidth;
    canvas.width= window.innerWidth;
    canvas.height= window.innerHeight;
    canvas.style.height = window.innerHeight;
})


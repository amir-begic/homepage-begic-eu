function draw() {
    
    ctx.fillStyle = '#004494';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // ease back to the resting drift, clamping so it settles exactly on it. the original
    // stepped past and bounced, which left the real speed at the mercy of float rounding
    let spinTarget = scrollClockwise ? baseSpin : -baseSpin;

    if (timeOffset > spinTarget){
        timeOffset = Math.max(spinTarget, timeOffset - spinDecay);
    }else{
        timeOffset = Math.min(spinTarget, timeOffset + spinDecay);
    }

    time += timeOffset;

    measureBoxSpeed();
    drawLines();
    drawStars(time);
    drawWhiteOverlay();
    drawPanelCopy();
    drawBoxes();
    drawPanelTitle();
    spinBoxes();
    requestAnimationFrame(draw);
}

function drawLines(){
    let onePercentX = window.innerWidth/100;
    let sectionCount = boxCount;
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

    tabs.forEach(function(tab, index){
        if (tab.format){
            textElements[index] = moment().format(tab.format);
        }
    });

    for (i=0; i < boxCount;i++){   
        let x = onePercentX*xPos;
        let y = offsetY[i];
        xPos += xOffset;

        if (i == panelIndex && dock.progress > 0){
            continue;
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, boxWidth, boxHeights[i]);

        ctx.strokeStyle = '#004494';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, boxWidth, boxHeights[i]);

        ctx.fillStyle = 'black';        
        ctx.fillText(textElements[i], x + boxWidth / 2 +  padding, y  + boxHeights[i] / 2 + padding);
    }
}

function spinBoxes(){
    for (i = 0; i < boxCount; i++){ 
        if (i == panelIndex && dock.progress > 0){
            continue;
        }

        let target = window.innerHeight * (boxHovered[i] ? hoverPosition : restPosition);

        // one tween per target change, not one per frame. re-making it every frame only
        // ever sampled the first instant of the curve, which pinned the box to full speed
        // from the off - given a whole tween the ease can wind up and then settle
        if (boxTarget[i] != target){
            let far = Math.abs(target - tweenElement[i].y) > window.innerHeight;

            boxTarget[i] = target;
            gsap.killTweensOf(tweenElement[i]);
            TweenMax.to(tweenElement[i], far ? tweenDuration[i] : liftDuration, {y: target, ease: "spin"});
        }

        offsetY[i] = tweenElement[i].y - (window.innerHeight * Math.floor(tweenElement[i].y/window.innerHeight));
    }  
}

// how far each box travelled since the last frame, measured before anything is drawn.
// the sign matters: a hovered box lifts towards a lower target, so it reads negative
function measureBoxSpeed(){
    for (i = 0; i < boxCount; i++){
        boxVelocity[i] = tweenElement[i].y - lastTweenY[i];
        boxSpeed[i] = Math.abs(boxVelocity[i]);
        lastTweenY[i] = tweenElement[i].y;
    }
}

// hand a box back to the row from a position on screen. tweenElement holds the running
// tween value, not a screen coordinate, so it has to be put inside the cycle the row
// rests in - otherwise the box falls through a whole extra spin on its way back down
function releaseBox(index, screenY, cyclesBack){
    let cycle = Math.floor(restPosition) - (cyclesBack || 0);
    let y = window.innerHeight * cycle + screenY;

    tweenElement[index] = {y: y};
    lastTweenY[index] = y;
    boxTarget[index] = null;
}

// how far a hovered box rises off the bottom edge
function maxLift(){
    return window.innerHeight * (restPosition - hoverPosition);
}

// the peek is the gap a lifting box leaves at the bottom edge. a box still settling
// after a spin sits in the same place but is on its way down, so the sign rules it out
function boxRevealing(index){
    let gap = window.innerHeight - (offsetY[index] + boxHeights[index]);

    return gap > 0 && gap <= maxLift() + 1 && boxVelocity[index] <= 0.5;
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
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#004494';
    ctx.lineWidth = 1;

    // the page peeking out from under whatever the pointer is over. it carries the same
    // outline as the box so the two read as one shape rather than a box over a gap
    for (i = 0; i < boxCount; i++){
        if (boxHovered[i] && boxRevealing(i)){
            let band = boxBand(i, offsetY[i], boxHeights[i]);

            // square all round: the top meets the tab and the bottom is the window edge
            ctx.fillRect(band.x, band.top, band.width, band.bottom - band.top);
            ctx.strokeRect(band.x, band.top, band.width, band.bottom - band.top);
        }
    }

    if (panel.progress <= 0){
        return;
    }

    let sheet = sheetRect();

    // only the top corners: the sheet sits on the bottom edge of the window the whole way
    // out, so rounding the bottom pair just cuts notches into the corners of the screen
    let r = sheetRadius(sheet.top);

    roundedPath(sheet.x, sheet.top, sheet.width, sheet.bottom - sheet.top, [r, r, 0, 0]);
    ctx.fill();
}

function cornerRadius(){
    return initialBoxHeight * 1.6;
}

// the sheet stays a bubble for almost the whole opening and only squares off over the
// last stretch, once it is nearly the full page - easing it away from the start made it
// read as a rectangle long before it had finished growing.
// it also starts square: while its top edge is still level with the tab, rounded corners
// would leave a notch either side of the tab with the blue showing through
function sheetRadius(top){
    let hold = 0.85;
    let closing = panel.progress <= hold ? 1 : (1 - panel.progress) / (1 - hold);
    let clearOfTab = (panelStartY - top) / cornerRadius();

    return cornerRadius() * Math.max(0, Math.min(closing, clearOfTab, 1));
}

// roundRect scales oversized radii down on its own, so only the floor at zero matters
function roundedPath(x, y, w, h, radii){
    ctx.beginPath();

    if (ctx.roundRect){
        ctx.roundRect(x, y, w, h, Array.isArray(radii) ? radii : Math.max(0, radii));
    }else{
        ctx.rect(x, y, w, h);
    }
}

function panelMargin(){
    return window.innerHeight > window.innerWidth ? 16 : 32;
}

// the sheet at rest: as wide as the box it belongs to, filling the gap the raised
// row leaves between its bottom edge and the bottom of the screen
function boxBand(index, top, height){
    return {
        x: window.innerWidth * index / boxCount,
        width: boxWidth,
        top: top + height,
        bottom: window.innerHeight
    };
}

// selecting unfolds that peek to the full page - it grows out of the box on every
// edge, so the sheet is never wider than the column it came from
function sheetRect(){
    let p = panel.progress;
    let resting = boxBand(panelIndex, panelStartY, panelStartHeight);

    return {
        x: resting.x * (1 - p),
        width: boxWidth + (window.innerWidth - boxWidth) * p,
        top: resting.top * (1 - p),
        bottom: resting.bottom + (window.innerHeight - resting.bottom) * p
    };
}

function panelMetrics(){
    let portrait = window.innerHeight > window.innerWidth;
    let margin = panelMargin();
    let labelSize = portrait ? 10 : 28;

    ctx.save();
    ctx.font = labelSize + "px eurocine-regular, Arial, sans-serif";
    let titleWidth = ctx.measureText(textElements[panelIndex]).width;
    ctx.restore();

    // the copy lines up under the docked title, wherever that title happens to sit
    let columnX = labelLeft(titleWidth, margin);
    let available = window.innerWidth - columnX - margin;

    // ...unless that leaves too little room, as it does for the right-hand boxes on a phone
    if (available < (portrait ? 240 : 380)){
        columnX = margin;
        available = window.innerWidth - margin * 2;
    }

    return {
        portrait: portrait,
        margin: margin,
        columnX: columnX,
        columnWidth: Math.min(680, available),
        labelSize: labelSize,
        headingSize: portrait ? 16 : 26,
        bodySize: portrait ? 13 : 18,
        lineHeight: portrait ? 21 : 29,
        blockGap: portrait ? 18 : 26
    };
}

// centred over its own box, nudged in only if the grown text would run off an edge
function labelLeft(labelWidth, margin){
    let boxX = window.innerWidth * panelIndex / boxCount;
    let centred = boxX + boxWidth / 2 - labelWidth / 2;

    return Math.max(margin, Math.min(centred, window.innerWidth - labelWidth - margin));
}

function drawPanelCopy(){
    let blocks = panelContent[panelIndex];

    // canvas text is just pixels, so remember where each linked line landed and test
    // clicks against those boxes. rebuilt every frame, since the copy moves as it opens
    linkHits = [];

    if (panel.progress <= 0 || dock.progress <= 0 || !blocks){
        return;
    }

    let alpha = Math.max(0, (dock.progress - 0.55) / 0.45);
    if (alpha <= 0){
        return;
    }

    let m = panelMetrics();

    let sheet = sheetRect();

    ctx.save();
    ctx.beginPath();
    ctx.rect(sheet.x, sheet.top, sheet.width, sheet.bottom - sheet.top);
    ctx.clip();

    ctx.globalAlpha = alpha;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    let y = m.margin + initialBoxHeight + m.lineHeight * 3;

    for (let b = 0; b < blocks.length; b++){
        let link = blocks[b].link;

        if (blocks[b].heading){
            ctx.fillStyle = 'black';
            ctx.font = m.headingSize + "px eurocine-regular, Arial, sans-serif";
            drawCopyLine(blocks[b].heading, m.columnX, y, m.headingSize, link);
            y += m.lineHeight;
        }

        // text is optional - a block can be just a linked heading
        if (blocks[b].text){
            ctx.fillStyle = '#004494';
            ctx.font = m.bodySize + "px Helvetica, Arial, sans-serif";
            let lines = wrapText(blocks[b].text, m.columnWidth);

            // the link marks the heading when there is one, otherwise the text itself
            let textLink = blocks[b].heading ? null : link;

            for (let l = 0; l < lines.length; l++){
                drawCopyLine(lines[l], m.columnX, y, m.bodySize, textLink);
                y += m.lineHeight;
            }
        }

        y += m.blockGap;
    }

    ctx.restore();
}

// one line of copy, underlined and registered as a hit target when it carries a link
function drawCopyLine(text, x, y, size, link){
    ctx.fillText(text, x, y);

    if (!link){
        return;
    }

    let width = ctx.measureText(text).width;
    let underline = y + Math.round(size * 0.18);

    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, underline);
    ctx.lineTo(x + width, underline);
    ctx.stroke();

    linkHits.push({x: x, top: y - size, width: width, height: size * 1.35, url: link});
}

function linkAt(x, y){
    for (let h = 0; h < linkHits.length; h++){
        let box = linkHits[h];

        if (x >= box.x && x <= box.x + box.width && y >= box.top && y <= box.top + box.height){
            return box;
        }
    }

    return null;
}

function drawPanelTitle(){
    if (dock.progress <= 0){
        return;
    }

    let m = panelMetrics();
    let y = panelStartY + (m.margin - panelStartY) * dock.progress;
    let height = panelStartHeight;

    ctx.font = m.labelSize + "px eurocine-regular, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let labelWidth = ctx.measureText(textElements[panelIndex]).width;
    let left = labelLeft(labelWidth, m.margin);
    let barX = Math.min(window.innerWidth * panelIndex / boxCount, left - m.margin);
    let barWidth = Math.max(boxWidth, labelWidth + m.margin * 2);

    // the title only ever travels up the y axis - x stays where its box was
    ctx.fillStyle = 'white';
    ctx.fillRect(barX, y, barWidth, height);

    ctx.strokeStyle = '#004494';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, y, barWidth, height);

    ctx.fillStyle = 'black';
    ctx.fillText(textElements[panelIndex], left, y + height / 2);
}

function wrapText(text, maxWidth){
    let words = text.split(' ');
    let lines = [];
    let line = '';

    for (let w = 0; w < words.length; w++){
        let candidate = line ? line + ' ' + words[w] : words[w];

        if (line && ctx.measureText(candidate).width > maxWidth){
            lines.push(line);
            line = words[w];
        }else{
            line = candidate;
        }
    }

    lines.push(line);
    return lines;
}

function showPanel(index){
    if (panelOpen && panelIndex == index){
        hidePanel();
        return;
    }

    // switching panels: drop the outgoing title where it stands and let it fall away
    // with the stream, rather than flying it back down to the spot it launched from
    if (panelOpen){
        releaseBox(panelIndex, 0);
        gsap.killTweensOf(dock);
        dock.progress = 0;
    }

    panelIndex = index;
    panelOpen = true;
    panelStartY = offsetY[index];
    panelStartHeight = boxHeights[index];

    gsap.killTweensOf(tweenElement[index]);
    boxHovered.fill(false);

    // the sheet is already down when switching, so only the title has to travel
    gsap.killTweensOf(panel);
    TweenMax.to(panel, 0.9, {progress: 1, ease: 'power3.inOut'});

    gsap.killTweensOf(dock);
    TweenMax.to(dock, 0.9, {progress: 1, ease: 'power3.inOut'});
}

function hidePanel(){
    if (!panelOpen){
        return;
    }

    panelOpen = false;
    releaseBox(panelIndex, panelStartY);

    gsap.killTweensOf(panel);
    TweenMax.to(panel, 0.6, {progress: 0, ease: 'power2.inOut'});

    gsap.killTweensOf(dock);
    TweenMax.to(dock, 0.6, {progress: 0, ease: 'power2.inOut'});
}

const imgStar = new Image(50,50);
imgStar.src = 'assets/star.png';

var canvas = document.querySelector('#canvas');
var main = document.querySelector('#main');
var spinbutton = document.querySelector('#spinbutton');

var scrollClockwise = true;
var time = 0;

// degrees of star rotation per frame. baseSpin is the resting drift, spinDecay is how
// quickly a scrolled boost bleeds back down to it, and the wheel adds spinBoost up to
// maxSpin. all four are in the same units, so scaling them together changes the overall
// pace without changing how punchy a scroll feels relative to the drift
var baseSpin = 0.2;
var spinDecay = 0.05;
var spinBoost = 0.5;
var maxSpin = 3;
var spinButtonBoost = 6;

var timeOffset = baseSpin;
var radiants = [0,30,60,90,120,150,180,210,240,270,300,330];

// everything below is derived from js/content.js, so the layout follows the content
var tabs = siteContent.tabs;
var boxCount = tabs.length;
var textElements = tabs.map(function(tab){ return tab.label || ''; });

var panelContent = {};
tabs.forEach(function(tab, index){
    if (tab.blocks){
        panelContent[index] = tab.blocks;
    }
});
// a spin sends the row this many screen heights before it lands. the tween covers that
// distance in a fixed time, so fewer screens means a gentler spin
var spinTravel = 5;

// the row lands one box height short of a whole number of screens, which puts its bottom
// edge flush with the window. a hovered box lifts liftFraction of a screen above that
var liftFraction = 0.025;
var restPosition = spinTravel - 1/32;
var hoverPosition = restPosition - liftFraction;
var restTweenY = window.innerHeight * restPosition;

// the row starts already settled - SPIN is what sends it falling from the top again
var initialOffset = window.innerHeight * (restPosition - Math.floor(restPosition));
// spin durations are staggered so the boxes do not land in unison, and cycle if the
// content ever holds more columns than there are entries here
var spinDurations = [2, 2.8, 2.85, 2.6, 2.2];
var tweenDuration = tabs.map(function(tab, index){ return spinDurations[index % spinDurations.length]; });
var liftDuration = 0.5;

var initialBoxHeight = window.innerHeight/32;
var boxWidth = window.innerWidth/boxCount;

// the row starts settled, so it starts at rest too
var boxTarget = tabs.map(function(){ return null; });
var offsetY = tabs.map(function(){ return initialOffset; });
var tweenElement = tabs.map(function(){ return {y: restTweenY}; });
var boxHeights = tabs.map(function(){ return initialBoxHeight; });
var boxHovered = tabs.map(function(){ return false; });
var boxSpeed = tabs.map(function(){ return 0; });
var boxVelocity = tabs.map(function(){ return 0; });
var lastTweenY = tabs.map(function(){ return restTweenY; });

var panelIndex = Math.max(0, tabs.findIndex(function(tab){ return !!tab.blocks; }));
var linkHits = [];
var panelOpen = false;
var panel = {progress: 0};
var dock = {progress: 0};
var panelStartY = 0;
var panelStartHeight = 0;



if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
}

function resizeCanvas(){
    let pr = window.devicePixelRatio;

    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = Math.floor(window.innerWidth * pr);
    canvas.height = Math.floor(window.innerHeight * pr);

    // setting width/height resets the transform, so the scale has to be re-applied
    ctx.scale(pr, pr);

    initialBoxHeight = window.innerHeight/32;
    boxHeights.fill(initialBoxHeight);
    boxWidth = window.innerWidth/boxCount;
    panelStartY = Math.min(panelStartY, window.innerHeight);
}

// starts from a standstill, winds up, then eases into place
CustomEase.create("spin", "M0,0,C0.5,0,0.2,1,1,1");

resizeCanvas();
draw();

window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click', (event)=> {
    var link = linkAt(event.clientX, event.clientY);

    if (link){
        if (link.url.indexOf('mailto:') == 0){
            window.location.href = link.url;
        }else{
            window.open(link.url, '_blank', 'noopener');
        }
        return;
    }

    var mousePositionX = event.clientX;
    var partition = Math.floor(boxCount / window.innerWidth * mousePositionX);

    if (panelContent[partition]){
        showPanel(partition);
    }else if (panelOpen){
        hidePanel();
    }
})

canvas.addEventListener('mousemove', (event)=>{
    canvas.style.cursor = linkAt(event.clientX, event.clientY) ? 'pointer' : 'default';

    boxHovered.fill(false);
    boxHeights.fill(initialBoxHeight);

    var mousePositionX = event.clientX;
    var partition = Math.floor(boxCount / window.innerWidth * mousePositionX);

    if (partition == panelIndex && dock.progress > 0){
        return;
    }

    if (panelContent[partition]){
        boxHovered[partition] = true;
    }
})

canvas.addEventListener('mouseleave', (event)=>{
    boxHovered.fill(false);
})

spinbutton.addEventListener('click', ()=> {
    hidePanel();

    // the stars get a shove too, and bleed back to the resting drift the way a scroll does
    timeOffset = spinButtonBoost;
    scrollClockwise = true;

    // put each box a whole number of screens behind its target. offsetY is unchanged by
    // that, so the row starts from exactly where it is sitting and winds down through the
    // screens, rather than blinking to the top of the window first
    for (i = 0; i < boxCount; i++){
        releaseBox(i, offsetY[i], spinTravel);
    }
})

window.addEventListener('wheel', (event)=>{
    if(event.deltaY < 0 && timeOffset > -maxSpin){
        timeOffset -= spinBoost;        
    }else if (event.deltaY > 0 && timeOffset < maxSpin){
        timeOffset += spinBoost;
    }
    scrollClockwise = timeOffset > 0;
});

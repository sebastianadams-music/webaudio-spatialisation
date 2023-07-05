// banks of audio files
const numberFiles = ["/sounds/1.wav", "/sounds/2.wav", "/sounds/3.wav", "/sounds/4.wav", "/sounds/5.wav", "/sounds/6.wav", "/sounds/7.wav", "/sounds/8.wav"]
var vincent = ["/sounds/vi_f_Wood_layer.wav", "/sounds/vi_f_Rock_layer.wav", "/sounds/vi_f_Mushroom_layer.wav", "/sounds/vi_f_Mouse_layer.wav", "/sounds/vi_f_Leaf_layer.wav", "/sounds/vi_f_Horse_layer.wav", "/sounds/vi_f_Fish_layer.wav", "/sounds/vi_f_Duck_layer.wav"]
const outfoxing = ["/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3"]
let audioFiles = numberFiles

// set up click event for trigger script
document.querySelector('#start').onclick = () => audioPlay(audioFiles);

// scale all distances 
const distanceScale = 200

// create audio context
const context = new AudioContext();
this.context = context

// expose listening position
var listener = context.listener
this.listener = listener

// declare and expose arrays of stuff
let panners = []
let sources = []
this.panners = panners
this.sources = sources

// this trigger function called when the play button is pressed initially
const audioPlay = async audioFiles => {
  let audioBuffers = await filesToBuffers(audioFiles) 
  for (let i = 0; i < 8; i++){
    createRadioObject(i, audioBuffers[i])
  }
  };

// functions

async function filesToBuffers(audioFiles) {
  let bufferArray = []
    //load file
  for (let file of audioFiles) {
    const audioBuffer = await fetch(file)
  .then(res => res.arrayBuffer())
  .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));
  bufferArray.push(audioBuffer)
  } 
  return bufferArray
  
  }

function createRadioObject(i, audioBuffer){
  namediv = document.createElement('div');
  namediv.textContent = "object_" + i 
  document.body.appendChild(namediv);
    // create a new sound source and panning node
    panners.push(newPannerNode())
    sources.push(createSource(audioBuffer, panners[i]))
  }

function newReceiver(){
  // receives 8 sources
  // applies 8 different gains
  // sends to one panner
  
}

function newPannerNode(){
  var panner = context.createPanner();
  panner.connect(context.destination)
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 200; // with my current settings, sounds seem to go to -inf by the time they get to 200.
  panner.rolloffFactor = 1;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;
  return panner
}


function createSource(buffer, panner) {
  source = context.createBufferSource();
  source.buffer = buffer;
  // sources[i].playbackRate.value = randomInRange(.5, 2)
  source.loop = true
  source.connect(panner);
  source.start(); // starts audio playback
  return source

}

// to play a new audio file
async function newAudioFile(files, i){
  audioBuffers = await filesToBuffers(files)
  sources[i].stop()
  sources[i] = createSource(audioBuffers[i], panners[i])
}

// functions to interface between p5 and WebAudio
function radioPosition(circle, index){
  panners[index].positionX.value = circle.norm_x * distanceScale
  panners[index].positionY.value = circle.norm_y * distanceScale

}

function listenerPosition(circle){
  context.listener.positionX.value = circle.norm_x * distanceScale
  context.listener.positionY.value = circle.norm_y * distanceScale
}




// p5 stuff-----------------------------------------------------------

//p5 setup and draw

function setup() {

  createCanvas(400, 400);
  listenerCircle = new Circle(200, 200, 10)
  radios = []

  for (let i = 0; i < 8; i++){
    let b = new Circle(random(width), random(height), 20)
    radios.push(b)
  }  
}

function draw() {
  background(220);
  if (keyIsPressed){
    listenerCircle = handleKey(listenerCircle)
    console.log(normXY(listenerCircle))
    listenerPosition(listenerCircle)
    for (let i = 0; i < radios.length; i++){
      normXY(radios[i])
      radioPosition(radios[i], i)
    }

  }
  drawCircle(listenerCircle)
  for (let i = 0; i < radios.length; i++){
    radios[i].x = randomWalk(radios[i].x, radios[i].d/2, width - radios[i].d/2)
    radios[i].y = randomWalk(radios[i].y, radios[i].d/2, (height - radios[i].d/2))
    drawCircleWithText(radios[i], i+1)
  }

}

//p5 functions and constructors

function handleKey(circle){

    if ((keyCode == RIGHT_ARROW) && (circle.x < (width - circle.d/2))){
      circle.x++;
    } else if ((keyCode == LEFT_ARROW) && (circle.x > circle.d/2)){
      circle.x--;
    } else if ((keyCode == UP_ARROW) && (circle.y > circle.d/2)) {
      circle.y--;
    } else if ((keyCode == DOWN_ARROW) && (circle.y < (height - circle.d/2))){
      circle.y++;
    }
    return circle
}

function drawCircleWithText(circle, i){
  ellipse(circle.x, circle.y, circle.d, circle.d);
  text(i, circle.x - circle.d/4, circle.y + circle.d/4)  
}

function drawCircle(circle){
  ellipse(circle.x, circle.y, circle.d, circle.d);
}

function normXY(circle){
  circle.norm_x = (((circle.x / width) * 2) - 1)
  circle.norm_y = (((circle.y / height) * 2) - 1) * -1
  return circle
}

class Circle {
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.d = d;
  }
}


// maths------------------------------------------------------------

function randomInRange(min, max){
  let c = (Math.random() * (max - min) + min)
  return c
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

function randomWalk(value, low, high){
  value = value + (random(10)-5)
  value = clamp(value, low, high)
  console.log(value)
  return value   
} 


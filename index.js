// for performance to stay the same when switching audio files, add a new layer of gain nodes which are "inputs" after the source, so that the source can be recreated and simply connect to those 8 source nodes.

// banks of audio files
const numberFiles = ["/sounds/1.wav", "/sounds/2.wav", "/sounds/3.wav", "/sounds/4.wav", "/sounds/5.wav", "/sounds/6.wav", "/sounds/7.wav", "/sounds/8.wav"]
const vincent = ["/sounds/vi_snd_11_5aptRome_outsideChild.mp3", "/sounds/vi_snd_11_5Fire_sausage.mp3", "/sounds/vi_snd_11_5forge-230215-000.mp3", "/sounds/vi_snd_11_5In_Water.mp3", "/sounds/vi_snd_11_5metro-230219-000.mp3", "/sounds/vi_snd_11_5Tree_percussion.mp3", "/sounds/vi_snd_11_5walk_mainArea.mp3"]
const outfoxing = ["/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3", "/outfoxing.mp3"]
const u2 = ["/sounds/u2-01.mp3", "/sounds/u2-02.mp3", "/sounds/u2-03.mp3", "/sounds/u2-04.mp3", "/sounds/u2-05.mp3", "/sounds/u2-06.mp3", "/sounds/u2-07.mp3", "/sounds/u2-08.mp3"]


// set up click event for trigger script
document.querySelector('#start').onclick = () => audioPlay(preLoadedFiles);
document.querySelector('#auto').onclick = () => autoMoveListener();
document.querySelector('#playnumbers').onclick = () => switchFiles(numberFiles);
document.querySelector('#playu2').onclick = () => switchFiles(u2);

document.querySelector('#loadfiles').onchange = () => loadFiles();
document.querySelector('#playfiles').onchange = () => playFiles();
window.onload = () => preLoadFiles(u2)

// scale all distances 
const distanceScale = 250
const numberOfRadios = 32
const movingSpeed = 12
// create audio context
const context = new AudioContext();
this.context = context

// stop clipping at exit (connect all last steps in chain to this!)
const compressor = context.createDynamicsCompressor()
compressor.connect(context.destination)

// expose listening position
var listener = context.listener
this.listener = listener

// declare and expose arrays of stuff
let panners = []
let sources = []
let channels = []
let receivers = []
this.panners = panners
this.sources = sources
this.receivers = receivers
this.channels = channels

// triggers on page load (see above)
const preLoadFiles = async (files) => {preLoadedFiles = await filesToBuffers(files) }

// this trigger function called when the play button is pressed initially
const audioPlay = async bufs => {
  // let audioBuffers = await filesToBuffers(preLoadedFiles)
  let audioBuffers = bufs
  console.log(audioBuffers)
// create sources
  for (let i = 0; i < audioBuffers.length; i++){
    sources.push(createSource(audioBuffers[i]))
    channels.push(context.createGain())
    console.log(channels)
    sources[i].connect(channels[i])
  }
  
// create receivers and panners
  for (let i = 0; i < numberOfRadios; i++){
    panners.push(newPannerNode()) 
    console.log(channels)
    receivers.push(newReceiver(channels, panners[i])) // outer list = panner; inner list = channel/radio
  }
  sources.forEach((s) => s.start())

}

// to load and play a new set of audio files
async function switchFiles(files){
  newBuf = await filesToBuffers(files)
  .then((newBuf) =>{for (let i = 0; i < sources.length; i++){
    sources.forEach((s) => s.stop())
  }
  console.log(sources)
  sources = []
  console.log(sources)
  for (let i = 0; i < newBuf.length; i++){
    sources.push(createSource(newBuf[i]))
    sources[i].connect(channels[i])
  }
  sources.forEach((s) => s.start())



})
  


}

function loadFiles() {
  var e = document.getElementById("playfiles");
  console.log(e.value)
}

function playFiles() {
  var e = document.getElementById("playfiles");
  console.log(e.value)
  let ld = document.getElementById("loadfiles")
  e
}

// to play a new audio file
async function newAudioFile(files, i){
  audioBuffers = await filesToBuffers(files)
  sources[i].stop()
  sources[i] = createSource(audioBuffers[i])
}


// functions

async function filesToBuffers(af) {
  console.log(af)
  let bufferArray = []
    //load file
  for (let [index, file] of af.entries()) {
    document.getElementById("loading").textContent = `loading file ${index + 1} of ${af.length}`
    // let song = "/folksongs/audio" + choice + ".mp3"
    let file_gh = "https://raw.githubusercontent.com/sebastianadams-music/webaudio-spatialisation/master/" + file //makes the file work for github pages
    const audioBuffer = await fetch(file_gh)
  .then(res => res.arrayBuffer())
  .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer))
  .then(console.log(file_gh, " loaded"))
  bufferArray.push(audioBuffer)
  } 
  document.getElementById("loading").textContent = ""
  return bufferArray
  
  }

// function createRadioObject(i){
//   namediv = document.createElement('div');
//   namediv.textContent = "object_" + i 
//   document.body.appendChild(namediv);
//     // create a new sound source and panning node
//   }

function newReceiver(listOfSources, panNode){
  // receives sources
  // applies gains for each source
  // sends to one panner
  let g = []
  for (let i = 0; i < listOfSources.length; i++){
    let node = context.createGain()
    node.gain.value = 0
    console.log("test", i, listOfSources)
    listOfSources[i%listOfSources.length].connect(node)
    g.push(node)
    node.connect(panNode)
  }
  return g
  
}

function createSource(buffer) {
  source = context.createBufferSource();
  source.buffer = buffer;
  // sources[i].playbackRate.value = randomInRange(.5, 2)
  source.loop = true
  // source.connect(panner);
  // source.start(); // starts audio playback
  return source

}


function newPannerNode(){
  var panner = context.createPanner();
  panner.connect(compressor)
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




// functions to interface between p5 and WebAudio-----------------------

function radioPosition(circle, index){
  for (let i = 0; i < receivers.length; i++){
    // for every receiver, compute the gains of all 8 transmitters

    for (let j = 0; j < receivers.length; j++){
      // get position of radio and check if it's in each circle
      
      // is radios[j] in the circle of each transmitter?
      for (let k = 0; k < transmitters.length; k++){
        circle_x = transmitters[k].x
        circle_y = transmitters[k].y
        radius = transmitters[k].d/2
        x = radios[j].x
        y = radios[j].y

        if (isInside(circle_x, circle_y, radius, x, y)){
          receivers[j][k].gain.value = 1
        }
        else {
          receivers[j][k].gain.value = 0
        }
      }

      //receivers[i][j].gain.value = 1
    }
  }
  // position info
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
  transmitters = []
  transmitterColors = []

  for (let i = 0; i < numberOfRadios; i++){
    let b = new Circle(random(width), random(height), 20)
    radios.push(b)
  }
  for (let i=0; i < 8; i++){
    let d = random(80, 200)
    let p = new Circle(transmitterPositions[i][0] * width, transmitterPositions[i][1] * height, transmitterPositions[i][2] * 2 * width)
    transmitters.push(p)
    transmitterColors.push(color(random(255), random(255), random(255)))
  }
    
}

function draw() {
  background(220);
  if (keyIsPressed){
    listenerCircle = handleKey(listenerCircle)
    console.log(normXY(listenerCircle))
    listenerPosition(listenerCircle)
    
  
  

  }

  for (let i=0; i < transmitters.length; i++){
    fill(transmitterColors[i])
    drawCircleWithText(transmitters[i], i+1)
    
  }
  for (let i = 0; i < radios.length; i++){
    normXY(radios[i])
    if (panners[0]){
      radioPosition(radios[i], i)
    } // if statement stops this running until audio has been activated. This is a workaround so that I don't have to learn how to stop p5 things running on load.

  }

  c = color(130);
    fill(c)
  drawCircle(listenerCircle)
  ellipse(listenerCircle.x, listenerCircle.y+(listenerCircle.d*2.5), listenerCircle.d*2, listenerCircle.d*4)
    for (let i = 0; i < radios.length; i++){
    radios[i].x = randomWalk(radios[i].x, radios[i].d/2, width - radios[i].d/2)
    radios[i].y = randomWalk(radios[i].y, radios[i].d/2, (height - radios[i].d/2))
    c = color(255);
    fill(c)
    drawCircleWithText(radios[i], i+1)
  }
  
}

//p5 functions and constructors

// need to change something to trigger this once the value of the button is true, rather than starting a function
function autoMoveListener(){
  listenerCircle.x = randomWalk(listenerCircle.x, listenerCircle.d/2, width - listenerCircle.d/2)
  listenerCircle.y = randomWalk(listenerCircle.y, listenerCircle.d/2, (height - listenerCircle.d/2))
}


function handleKey(circle){

    if ((keyCode == RIGHT_ARROW) && (circle.x < (width - circle.d/2))){
      circle.x+= movingSpeed;
    } else if ((keyCode == LEFT_ARROW) && (circle.x > circle.d/2)){
      circle.x-= movingSpeed;
    } else if ((keyCode == UP_ARROW) && (circle.y > circle.d/2)) {
      circle.y-= movingSpeed;
    } else if ((keyCode == DOWN_ARROW) && (circle.y < (height - circle.d/2))){
      circle.y+= movingSpeed;
    }
    return circle
}

function drawCircleWithText(circle, i){
  // c = color(255);
  // fill(c)
  ellipse(circle.x, circle.y, circle.d, circle.d);
  fill(color(0))
  text(i, circle.x - 5, circle.y + 5)  

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

// p5 transmitter co-ordinates
transmitterPositions = [[0.1766, 0.2024, 0.2508], [0.5044, 0.1195, 0.2000], [0.8496, 0.1504, 0.2000], [0.8512, 0.6267, 0.2500], [0.2999, 0.5215, 0.2357], [0.5828, 0.8334, 0.1886], [0.3689, 0.8842, 0.1738], [0.1113, 0.8516, 0.1702], [0.5538, 0.6231, 0.0630], [0.9238, 0.3801, 0.0940], [0.4160, 0.3184, 0.1085], [0.3398, 0.6267, 0.0940], [0.0461, 0.5360, 0.0940], [0.6481, 0.2278, 0.0940], [0.8657, 0.9640, 0.1303], [0.5901, 0.4526, 0.1375]]



// maths------------------------------------------------------------

function randomInRange(min, max){
  let c = (Math.random() * (max - min) + min)
  return c
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

function randomWalk(value, low, high){
  value = value + (random(10)-5)
  value = clamp(value, low, high)
  // console.log(value)
  return value   
} 

function isInside(circle_x, circle_y, rad, x, y)
{
     
    // Compare radius of circle with
    // distance of its center from
    // given point
     
    if ((x - circle_x) * (x - circle_x) +
        (y - circle_y) * (y - circle_y) <= rad * rad)
        return true;
    else
        return false;
}


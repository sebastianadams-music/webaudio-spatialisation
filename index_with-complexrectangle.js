// this main function called when the play button is pressed
const audioPlay = async url => {

    const context = new AudioContext();
    this.context = context

    // expose listening position

    var listener = context.listener
    this.listener = listener

    //load file
    const audioBuffer = await fetch(url)
    .then(res => res.arrayBuffer())
    .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

    let panners = []
    let sources = []
    let xSliders = []
    let ySliders = []
    this.panners = panners
    this.sources = sources
    this.xSliders = xSliders
    this.ySliders = ySliders

    for (let i = 0; i < 8; i++){
      createRadioObject(i, audioBuffer)
    }




  
// create listener sliders and event listeners
var namediv = document.createElement('div');
namediv.textContent = "listener"
document.body.appendChild(namediv);

//vars for listeners
var listenList = ["xListen", "yListen", "zListen"]
var listenerObjects = []
var listenParams = [listener.positionX, listener.positionY, listener.positionZ]

// for each loop to create listeners
listenList.forEach(

  function(sliderName, index){
    listenerObjects.push({...radio})
    listenerObjects[index].id = sliderName
    listenerObjects[index].addToDOM()
    setUpSliderEvent(sliderName, listenParams[index])
  }
)
    
  };
// end of main function

// set up click event for main script
document.querySelector('#start').onclick = () => audioPlay('outfoxing.mp3');

// scale all distance sliders 
const sliderScale = 50

// prototype for radio object 
const radio = {
  type: 'range',
  min: -sliderScale,
  max: sliderScale,
  value: 0.5,
  step: 0.1,
  id: "default",
  // slideAction: panner.positionX,
  addToDOM: function() {
    // var sliders = document.getElementById("slidercontainer")
    var slider = document.createElement('input');
    console.log("this", this)
    slider.id = this.id
    slider.type = this.type
    slider.min = this.min
    slider.max = this.max
    slider.value = this.value
    slider.step = this.step
    document.body.appendChild(slider)
    newThis = this
    // console.log("newthis: ", newThis)

  },

}

function setUpSliderEvent(sliderID, audioParameter){
  let el = document.getElementById(sliderID)
  el.addEventListener("change", function(){ 
        audioParameter.value = el.value; 
        console.log(el.id, audioParameter.value)}, 
        true)

}

     // function to collect listener slider data
     function logListenerValues(slidercat) {
      ev = event.target.id
      el = document.getElementById(ev)
      val = el.value
  
      if (ev === slidercat + "xvalue") {
        console.log("x: ", val)
        listener.positionX.value = val
      } 
      else if (ev === slidercat + "yvalue") {
        console.log("y: ", val)
        listener.positionY.value = val
      }
      else if (ev === slidercat + "yvalue") {
        console.log("z: ", val)
        listener.positionZ.value = val
  
      }
    }

 

function createRadioObject(i, audioBuffer){
namediv = document.createElement('div');
namediv.textContent = "object_" + i 
document.body.appendChild(namediv);
  // create a new sound source and panning node
  panners.push(newPannerNode())
  sources.push(context.createBufferSource());
  sources[i].buffer = audioBuffer;
  sources[i].playbackRate.value = randomInRange(.5, 2)
  sources[i].connect(panners[i]);
  sources[i].start(); // starts audio playback

  // create sliders
  //X
  xSliders.push({...radio})
  xSliders[i].id = "X" + xSliders.indexOf(xSliders[i])
  xSliders[i].addToDOM()
  setUpSliderEvent(xSliders[i].id, panners[i].positionX)
  //Y
  ySliders.push({...radio})
  ySliders[i].id = "Y" + ySliders.indexOf(xSliders[i])
  ySliders[i].addToDOM()
  setUpSliderEvent(ySliders[i].id, panners[i].positionY)
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

function randomInRange(min, max){
  let c = (Math.random() * (max - min) + min)
  return c
}


// p5 stuff

let rectangle;

function setup() {
  createCanvas(600, 400);

  let x = random(width);
  let y = random(height);
  let w = random(10, 40);
  let h = random(10, 40);
  rectangle = new Rectangle(x, y, w, h);
}

function draw() {
  background(0);
  rectangle.show(mouseX, mouseY);
}


function mousePressed() {
  rectangle.pressed(mouseX, mouseY);
}

function mouseReleased() {
  rectangle.notPressed();
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dragging = false;
    this.rollover = false;
  }

  show(px, py) {
    if (this.dragging) {
      this.x = px + this.offsetX;
      this.y = py + this.offsetY;
    }

    stroke(255);
    noFill();
    rect(this.x, this.y, this.w, this.h);
  }

  pressed(px, py) {
    if (px > this.x && px < this.x + this.w && py > this.y && py < this.y + this.h) {
      print("clicked on rect");
      this.dragging = true;
      this.offsetX = this.x - px;
      // print(this.offsetX);
      this.offsetY = this.y - py;
      // print(this.offsetY);
    }
  }

  notPressed(px, py) {
    	print("mouse was released");
      this.dragging = false;
     let norm_x = (((rectangle.x / 600) * 2) - 1)
     let norm_y = (((rectangle.y / 400) * 2) - 1) * -1
     console.log(document.getElementById("xListen").value)
     document.getElementById("xListen").value = norm_x * sliderScale
     context.listener.positionX.value = norm_x * sliderScale
     document.getElementById("yListen").value = norm_y * sliderScale
     context.listener.positionY.value = norm_y * sliderScale
      print(norm_x, norm_y)
  }
}
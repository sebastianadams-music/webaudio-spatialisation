/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Draws a canvas and tracks mouse click/drags on the canvas.
function Field(canvas) {
    this.ANGLE_STEP = 0.2;
    this.canvas = canvas;
    this.isMouseInside = false;
    this.center = {x: canvas.width/2, y: canvas.height/2};
    this.angle = 0;
    this.point = null;
  
    var obj = this;
    // Setup mouse listeners.
    canvas.addEventListener('mouseover', function() {
      obj.handleMouseOver.apply(obj, arguments)
    });
    canvas.addEventListener('mouseout', function() {
      obj.handleMouseOut.apply(obj, arguments)
    });
    canvas.addEventListener('mousemove', function() {
      obj.handleMouseMove.apply(obj, arguments)
    });
    canvas.addEventListener('wheel', function() {
      obj.handleMouseWheel.apply(obj, arguments);
    });
    // Setup keyboard listener
    window.addEventListener('keydown', function() {
      obj.handleKeyDown.apply(obj, arguments);
    });
  
    this.manIcon = new Image();
    this.manIcon.src = 'res/man.svg';
  
    this.speakerIcon = new Image();
    this.speakerIcon.src = 'res/speaker.svg';
  
    // Render the scene when the icon has loaded.
    var ctx = this;
    this.manIcon.onload = function() {
      ctx.render();
    }
  }
  
  Field.prototype.render = function() {
    // Draw points onto the canvas element.
    var ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    ctx.drawImage(this.manIcon, this.center.x - this.manIcon.width/2,
                                this.center.y - this.manIcon.height/2);
    ctx.fill();
  
    if (this.point) {
      // Draw it rotated.
      ctx.save();
      ctx.translate(this.point.x, this.point.y);
      ctx.rotate(this.angle);
      ctx.translate(-this.speakerIcon.width/2, -this.speakerIcon.height/2);
      ctx.drawImage(this.speakerIcon, 0, 0);
      //ctx.drawImage(this.speakerIcon, this.point.x - this.speakerIcon.width/2,
      //                                this.point.y - this.speakerIcon.height/2);
      ctx.restore();
    }
    ctx.fill();
  };
  
  Field.prototype.handleMouseOver = function(e) {
    this.isMouseInside = true;
  };
  
  Field.prototype.handleMouseOut = function(e) {
    this.isMouseInside = false;
    if (this.callback) {
      this.callback(null);
    }
    this.point = null;
    this.render();
  };
  
  Field.prototype.handleMouseMove = function(e) {
    if (this.isMouseInside) {
      // Update the position.
      this.point = {
        x: e.offsetX == undefined ? (e.layerX - e.currentTarget.offsetLeft) : e.offsetX,
        y: e.offsetY == undefined ? (e.layerY - e.currentTarget.offsetTop) : e.offsetY
      };
      // Re-render the canvas.
      this.render();
      // Callback.
      if (this.callback) {
        // Callback in coordinate system centered at canvas center.
        this.callback({x: this.point.x - this.center.x,
                       y: this.point.y - this.center.y});
      }
    }
  };
  
  Field.prototype.handleKeyDown = function(e) {
    // If it's right or left arrow, change the angle.
    if (e.keyCode == 37 || e.keyCode == 38) {
      this.changeAngleHelper(-this.ANGLE_STEP);
    } else if (e.keyCode == 39 || e.keyCode == 40) {
      this.changeAngleHelper(this.ANGLE_STEP);
    }
  };
  
  Field.prototype.handleMouseWheel = function(e) {
    e.preventDefault();
    this.changeAngleHelper(e.deltaY/100);
  };
  
  Field.prototype.changeAngleHelper = function(delta) {
    this.angle += delta;
    if (this.angleCallback) {
      this.angleCallback(this.angle);
    }
    this.render();
  }
  
  Field.prototype.registerPointChanged = function(callback) {
    this.callback = callback;
  };
  
  Field.prototype.registerAngleChanged = function(callback) {
    this.angleCallback = callback;
  };
  
  // Super version: http://chromium.googlecode.com/svn/trunk/samples/audio/simple.html
  
  function SpatializedSample(el) {
    var sample = this;
    this.isPlaying = false;
    this.size = {width: 400, height: 300};
  
    // Load the sample to pan around.
    loadSounds(this, {
      buffer: 'sounds/position.wav'
    });
  
    // Create a new canvas element.
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', this.size.width);
    canvas.setAttribute('height', this.size.height);
    el.appendChild(canvas);
  
    // Create a new Area.
    field = new Field(canvas);
    field.registerPointChanged(function() {
      sample.changePosition.apply(sample, arguments);
    });
    field.registerAngleChanged(function() {
      sample.changeAngle.apply(sample, arguments);
    });
  }
  
  SpatializedSample.prototype.play = function() {
    // Hook up the audio graph for this sample.
    var source = context.createBufferSource();
    source.buffer = this.buffer;
    source.loop = true;
    var panner = context.createPanner();
    // panner.coneOuterGain = 0.1;
    // panner.coneOuterAngle = 180;
    panner.coneGain = 0.5;
    panner.coneInnerAngle = 180;
    panner.distanceModel = "linear"
    panner.refDistance = .1
    panner.maxDistance = 1000000
    panner.rolloffFactor = 1;

        // Set the panner node to be at the origin looking in the +x
    // direction.
    panner.connect(context.destination);
    source.connect(panner);
    source.start(0);
    // Position the listener at the origin.
    context.listener.setPosition(0, 0, 0);
    foo = panner;
  
    // Expose parts of the audio graph to other functions.
    this.source = source;
    this.panner = panner;
    this.isPlaying = true;
  }
  
  SpatializedSample.prototype.stop = function() {
    this.source.stop(0);
    this.isPlaying = false;
  }
  
  SpatializedSample.prototype.changePosition = function(s) {
    // Position coordinates are in normalized canvas coordinates
    // with -0.5 < x, y < 0.5
    if (position) {
      if (!this.isPlaying) {
        this.play();
      }
      var SCALE = 100000 
      var mul = 2 * SCALE;
      var x = position.x / (this.size.width * SCALE);
      var y = -position.y / (this.size.height * SCALE);
      this.panner.setPosition(x * mul, y * mul, -0.5);
    } else {
      this.stop();
    }
  };
  
  SpatializedSample.prototype.changeAngle = function(angle) {
    console.log(angle);
    // Compute the vector for this angle.
    if (this.panner) {
      this.panner.setOrientation(Math.cos(angle), -Math.sin(angle), 1);
    }
  };
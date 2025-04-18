/**
 * The JavaScript code creates a particle simulation on an HTML canvas with gravity and collision
 * interactions, supporting both mouse and device orientation input.
 */
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let paused = true;

let width = window.innerWidth;
let height = window.innerHeight;

let isMouseDown = false;
let mousePos;

let lastTime = performance.now();
let accumulated = 0;

let particles = []
let holdedParticle = null;

let gravityX = 0;
let gravityY = -9.81;

parameters = {
    "border-restitution": 0.5,
    "self-restitution": 0.5
}

function resizeCanvas() {
    const ratio =  window.devicePixelRatio || 1;
    function getRandomColor() {
        const hue = Math.floor(Math.random() * 360); // Full hue circle
        const saturation = 70 + Math.random() * 20;  // 70–90% saturation (vivid)
        const lightness = 75 + Math.random() * 15;   // 75–90% lightness (soft/bright)
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = `${window}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(ratio, ratio);
}

function start(){
    resizeCanvas();
}

function update(currentTime){
    ctx.clearRect(0, 0, width, height);

    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (!paused){
    for (let i = 0; i < particles.length; i++){
        let particle = particles[i];

        particle.addForce(gravityX, gravityY);
        particle.update(delta * 10);
        particle.borderCollisions(width, height, parameters["border-restitution"]);
    }

    for (let i = 0; i < particles.length; i++){
        let particle = particles[i];
        for (let j = 0; j < particles.length; j++){
            if (i == j){
                continue;
            }
            let other = particles[j];

            particle.collideOther(other, parameters["self-restitution"]);
        }
    }

    for (let i = 0; i < particles.length; i++){
        let particle = particles[i];

        particle.draw(ctx, width, height);
    }

    if (holdedParticle != null){
        holdedParticle.draw(ctx, width, height);
    }

    if (isMouseDown){
        accumulated += delta;
        if (accumulated >= 0.05){
            particles.push(new Particle(mousePos.x, mousePos.y, Math.random() * (8 - 3) + 3, getRandomColor()));
            accumulated -= 0.05;
        }
    }
    }

    requestAnimationFrame(update); // recursive call for next update
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360); // Full hue circle
    const saturation = 70 + Math.random() * 20;  // 70–90% saturation (vivid)
    const lightness = 75 + Math.random() * 15;   // 75–90% lightness (soft/bright)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

window.addEventListener('resize', resizeCanvas);

document.getElementById('overlay').addEventListener('click', async () => { await requestDeviceOrientation(); });

function isDesktop() {
    const ua = navigator.userAgent.toLowerCase();
    return !(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
  }
  
async function requestDeviceOrientation(){
    if (isDesktop()){
        paused = false;
        document.getElementById('overlay')?.remove(); 
        return;
    }

    if (typeof DeviceOrientationEvent != 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
        // iOs 13+
        try{
            const permissionState = await DeviceOrientationEvent.requestPermission();
            if (permissionState === 'granted'){
                startTracking();
            }
            else{
                alert('device orientation access denide.');
            }
        }
        catch(error){
            alert('error: ' + error);
        }
    }
    else if ('DeviceOrientationEvent' in window){
        startTracking();
    }
    else{
        alert('device orientation not supported');
    }
}
  
function startTracking() {
    paused = false;
    document.getElementById('overlay')?.remove();
  
    window.addEventListener('deviceorientation', (event) => {
      const beta = event.beta * (Math.PI / 180);   // front-back tilt
      const gamma = event.gamma * (Math.PI / 180); // left-right tilt
  
      const g = 9.81;
  
      gravityX = Math.sin(gamma) * g;
      gravityY = -Math.sin(beta) * g;
    });
}

// Mouse
window.addEventListener('mousedown', onPointerDown);
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('mouseup', onPointerUp);

// Touch
window.addEventListener('touchstart', (e) => onPointerDown(e.touches[0]));
window.addEventListener('touchmove', (e) => onPointerMove(e.touches[0]));
window.addEventListener('touchend', onPointerUp);

function getMouseWorldCoords(event) {
    return {
        x: event.clientX - width / 2,
        y: (height / 2 - event.clientY)
    };
}

function onPointerDown(event) {
    isMouseDown = true;
    mousePos = getMouseWorldCoords(event);
}

function onPointerMove(event) {
    mousePos = getMouseWorldCoords(event);
}

function onPointerUp(event) {
    isMouseDown = false;
    mousePos = getMouseWorldCoords(event);
}

start();
update();

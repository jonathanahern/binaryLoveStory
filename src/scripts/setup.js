import { startListening } from "../index";
import { soundArr, clearArr } from "./sketch";
import { colorArr, moveBubble, bubbleLoop, scoreText, tryAgain} from "./bubbleMaker";

const welcome = `Welcome to Siren Song.<br>Click below to access the microphone`;
const lowSound = "Great! Now give us your lowest guttural bellow";
const highSound = "Not bad! How about the highest angelic note you can muster";
const readyString = "Okay Siren, sink those sailors and don't let too many get away!";
const gameOverText = "GAME OVER!";
const cantHear = "Loosen your pipes! I can't hear you";

var text = null;
var parent = null;
var frontCloud = null;
var buttonHolder = null;
var setupLoopInterval = null;
var loadingGif = null;
var microphoneIcon = null;
var cloudInstruction = null;
var cloudModule = null;
let makingBubble=false;
let phase = 1;
let currentBubble;
let currentPitchArr = [];
let splashPos = 0;
let empties = 0;
let gameReady = false;
let instructionOccuring = false;
export var lowNote = 0;
export var highNote = 100;
const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

document.addEventListener("DOMContentLoaded", () => {

  text = document.getElementById("module-text");
  parent = document.getElementById("dropHolder");
  frontCloud = document.getElementById("cloudFront");
  buttonHolder = document.getElementById("button-holder");
  loadingGif = document.getElementById("loading-gif");
  microphoneIcon = document.getElementById("microphone-icon");
  cloudModule = document.getElementById("cloud-module");
  cloudInstruction = document.getElementById("cloud-instruction");

  text.innerHTML = welcome;
  document.getElementById("try-again-button").onclick = function tryAgainInABit() {
    cloudModule.classList.add("cloudUp");
    cloudModule.classList.remove("cloudDown");
    cloudModule.classList.remove("float");
    setTimeout(function() {
      tryAgain();
    },2000)
  };

  document.getElementById("button-holder").onclick = function addMic() {
    if (phase === 1){
      loadingGif.classList.remove("hidden");
      microphoneIcon.classList.add("hidden");
      startListening();
      setupLoop();
      phase = 2;
      setTimeout(function() {
        if(phase === 2 && !makingBubble){
          cloudInstruction.innerHTML = cantHear;
          instructionOccuring = true;
        }
      },10000)
    }
  }

});

function clearInstruction(){
  cloudInstruction.innerHTML = "";
  instructionOccuring = false;
}

export function lowListenMode(){
  gameReady = true;
  text.innerHTML = lowSound;
  buttonHolder.classList.add("hidden");
}

function highListenMode(){
  gameReady=true;
  lowNote = splashPos;
  currentPitchArr = [];
  phase = 3;
  text.innerHTML = highSound;
}

function readyMode(){
  highNote = splashPos;
  phase = 4;
  text.innerHTML = readyString;
  setTimeout(function() { startGame() },5000)
}

function startGame(){
  cloudModule.classList.add("cloudUp");
  cloudModule.classList.remove("float");
  clearInterval(setupLoopInterval);
  document.getElementById("health-bar-container").classList.remove("hidden");
  document.getElementById("sailor-score").classList.remove("hidden");
  bubbleLoop();
}

function setupLoop() {

    setupLoopInterval = setInterval(function () {
        let soundSize = soundArr.length;
        empties = (soundSize < 2) ? empties +=1 : empties = 0;
        if (!makingBubble && soundSize >= 2 && gameReady) {
            if (instructionOccuring){clearInstruction();}
            empties = 0;
            makingBubble = true;
            currentBubble = document.createElement("DIV");
            let pitch = (arrAvg(soundArr))-50;
            currentPitchArr.push(pitch);
            let colorReturn = getBubbleSetup(pitch);
            currentBubble.style.backgroundColor = colorReturn[0];
            splashPos = colorReturn[2];
            currentBubble.className = "bubble wiggle";
            currentBubble.style.left = "50%";
            currentBubble.style.width = "50px";
            currentBubble.style.height = "50px";
            currentBubble.style.marginTop = "-60px";
            parent.insertBefore(currentBubble, frontCloud);
        } else if (makingBubble && empties < 4) {
            if (soundArr.length> 1) {
                let newPitch = (arrAvg(soundArr));
                currentPitchArr.push(newPitch);
                if (currentPitchArr.length > 6){
                  currentPitchArr.shift();
                }
                let avgPitch = arrAvg(currentPitchArr)-50;
                let newColorReturn = getBubbleSetup(avgPitch);
                currentBubble.style.marginTop = "60px";
                currentBubble.style.backgroundColor = newColorReturn[0];
                currentBubble.style.left = newColorReturn[1];
                splashPos = newColorReturn[2];
                if (instructionOccuring){
                  clearInstruction();
                }
            }
        } else if (makingBubble && empties > 3){
          if (phase === 2){
            if (splashPos > 60){
              instructionOccuring = true;
              cloudInstruction.innerHTML = "Too high! Sing lower";
            } else {
              dropIt();
            }
          } else if (phase ===3){
            if (splashPos < 40 || (splashPos - lowNote) < 10) {
              instructionOccuring = true;
              cloudInstruction.innerHTML = "Too low! Sing higher";
            } else {
              dropIt();
            }
          }
          
        }
        clearArr();
    }, 400);
};

function dropIt(){
  setTimeout(function () {
            $(".water-container").raindrops("splash", splashPos, 500);
            if (phase===2){
              highListenMode();
            } else if (phase === 3){
              readyMode();
            }
  }, 1350);
  makingBubble = false;
  moveBubble(currentBubble, parent);
  gameReady=false;
}

function getBubbleSetup(pitch) {
  
    function clamp(num, min, max) {
      return num <= min ? min : num >= max ? max : num;
    }

    let newPitch = Math.round((clamp(Math.ceil(pitch), 0, 380))/4);
    let pitchStr = newPitch.toString() + "%";
    if (newPitch < 20) {
        return [colorArr[0], pitchStr, newPitch];
    } else if (newPitch >= 20 && newPitch < 40) {
        return [colorArr[1], pitchStr, newPitch];
    } else if (newPitch >= 40 && newPitch < 60) {
        return [colorArr[2], pitchStr, newPitch];
    } else if (newPitch >= 60 && newPitch < 80) {
        return [colorArr[3], pitchStr, newPitch];
    } else {
        return [colorArr[4], pitchStr, newPitch];
    }
}

function correctPitch(){
  // console.log(phase,splashPos);
  if(phase===2){
    if (splashPos > 50){
      instructionOccuring = true;
      cloudInstruction.innerHTML = "Too high! Sing lower";
      return false;
    } else {
      return true;
    }

  } else if (phase===3){

  } else {
    return true
  }

}

export function gameOver(){
  text.innerHTML = gameOverText;
  document.getElementById("gameover-div").classList.remove("hidden");
  document.getElementById("sailor-score-text-gameover").innerHTML = parseInt(scoreText.innerHTML);
  cloudModule.classList.remove("cloudUp");
  cloudModule.classList.add("float");
  cloudModule.classList.add("cloudDown");
}
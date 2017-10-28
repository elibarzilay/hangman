"use strict";

// ============================================================================
// Library functions
let synth1 = new Tone.PluckSynth({
    attackNoise: 0.5, resonance: 0.75, dampening: 7000})
  .toMaster();
let synth2 = new Tone.Synth().toMaster();
Tone.Master.volume.value = -12;
function beep1() {
  synth1.triggerAttackRelease("c4", "32n", undefined, 0.1);
};
function beep2(note) {
  synth2.triggerAttackRelease(note, "32n");
};
let theVoice;
speechSynthesis.getVoices();
setTimeout(() => theVoice = speechSynthesis.getVoices()
                   .find(x => x.name == "Google US English"),
           2000);
function say(str) {
  let ut = new SpeechSynthesisUtterance(str);
  ut.pitch = 0.75;
  ut.rate = 1.25;
  if (theVoice) ut.voice = theVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(ut);
};
// ============================================================================

const States = {spin: "spin", play: "play", win: "win", lose: "lose"};
const endStates = [States.win, States.lose];
function isEnd(state) {
  return endStates.includes(state);
}

let theWord, dispWord, mistakes, gameState;

function chooseWord() {
  return words[Math.floor(Math.random() * words.length)];
};

function elem(id) {
  return document.getElementById(id);
}

function updateDisp() {
  let lives = 10 - mistakes.length;
  elem("word").textContent = dispWord;
  elem("bad-chars").textContent = mistakes;
  elem("lives-left").textContent = lives;
  elem("restart").style.display = isEnd(gameState) ? "block" : "none";
  elem("word").className = gameState;
  elem("visual").src = "man" + lives + ".svg";
};

let keymap = {};

function handleKey(ev) {
  if (ev.type == "click") {
    ev.key = ev.target.textContent;
    ev.repeat = false;
  }
  if (ev.repeat || ev.ctrlKey || ev.altKey || ev.key.length != 1
      || gameState != States.play)
    return;
  let key = ev.key.toLowerCase();
  if (key < "a" || key > "z") return;
  keymap[key].style.backgroundColor = "#777";
  if (dispWord.includes(key) || mistakes.includes(key)) {
    // repeated key
    say("You've already entered " + key + "!");
  } else if (!theWord.includes(key)) {
    // wrong key
    say("Wrong! There's no " + key + " in the word!");
    mistakes += key;
  } else {
    // correct key
    beep2("b4");
    say("Correct! There's " + key + " in the word!");
    let newDisp = "";
    for (let i in theWord) {
      newDisp += (theWord[i] == key) ? key : dispWord[i];
    }
    dispWord = newDisp;
  }
  if (mistakes.length >= 10) { // lose
    say("Oh no! You lost! The word was " + theWord + "!");
    gameState = States.lose;
  } else if (theWord == dispWord) { // win
    say("Yay! You win! The word was " + theWord + "!");
    gameState = States.win;
  }
  updateDisp();
};

let delay;
function spin() {
  beep1();
  theWord = chooseWord();
  dispWord = "_".repeat(theWord.length);
  mistakes = "";
  updateDisp();
  delay *= 1.2;
  if (delay < 1000) {
    setTimeout(spin, delay);
  } else {
    say("Start guessing!");
    gameState = States.play;
    updateDisp();
  }
};

function run() {
  delay = 15;
  gameState = States.spin;
  for (let elt of document.getElementsByClassName("key")) {
    elt.style.backgroundColor = "";
  }
  spin();
}

function init() {
  document.addEventListener("keyup", handleKey);
  for (let elt of document.getElementsByClassName("key")) {
    elt.addEventListener("click", handleKey);
    keymap[elt.textContent] = elt;
  }
  elem("restart").addEventListener("click", run);
  run();
}

window.addEventListener("load", init);

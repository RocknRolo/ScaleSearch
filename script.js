// Author: Roel Kemp (RocknRolo).

// This part of the code deals with defining Tone and Scale objects and calculating scales.

const SEMITONES = "C D EF G A B";
const NATURALS = SEMITONES.replaceAll(" ","");
const IONIAN_PATTERN = [2, 2, 1, 2, 2, 2, 1];

class Tone {
    constructor(natural, flatSharp, interval) {
        this.natural = natural.toUpperCase();
        this.flatSharp = (parseInt(flatSharp)) || 0;
        this.interval = interval || 0;

        this.toString = () => {
            let accidentals = "";
            for (let i = 0; i < Math.abs(flatSharp); i++) {
                accidentals += (flatSharp < 0 ? "b" : "#");
            }
            return natural + accidentals;
        };
    }
}

class Scale {
    constructor(root, mode) {
        mode = mode || 1;

        let tones = [];
        let accidentals;
        let semitoneSteps = 0;
        for (let i = 1; i <= NATURALS.length; i++) {
            tones.push(calcTone(i, semitoneSteps));
            semitoneSteps += calcWholeHalfPattern()[i - 1];
        }
        this.tones = tones;

        function calcTone(interval, semitoneSteps) {
            let targetNatural = safeGetItem(NATURALS.indexOf(root.natural) + interval - 1, NATURALS);
            let flatSharpOffset = root.flatSharp;

            if (safeGetItem(SEMITONES.indexOf(root.natural) + semitoneSteps, SEMITONES) !== targetNatural) {
                for (let i = 1; i <= 6; i++) {
                    if (safeGetItem(SEMITONES.indexOf(root.natural) + semitoneSteps - i, SEMITONES) === targetNatural) {
                        flatSharpOffset += i;
                        break;
                    } else if (safeGetItem(SEMITONES.indexOf(root.natural) + semitoneSteps + i, SEMITONES) === targetNatural) {
                        flatSharpOffset -= i;
                        break;
                    }
                }
            }
            accidentals += flatSharpOffset;
            return new Tone(targetNatural, flatSharpOffset, interval);
        }

        function calcWholeHalfPattern() {
            let index = mode - 1;
            while (index < 0) {
                index += IONIAN_PATTERN.length;
            }
            let pattern = [];
            for (let i = 0; i < IONIAN_PATTERN.length; i++) {
                pattern[i] = IONIAN_PATTERN[(index + i) % IONIAN_PATTERN.length];
            }
            return pattern;
        }

        this.toString = () => {
            let sclStr = "";
            for (let i = 0; i < tones.length; i++) {
                sclStr += tones[i] + (i === tones.length - 1 ? "" : " ");
            }
            return sclStr;
        };
    }
}

function safeGetItem(index, array) {
    while (index < 0) {
        index += array.length;
    }
    return array[index % array.length];
}

function getSemitonesBetween(tone1, tone2) {   
    index1 = SEMITONES.indexOf(tone1.natural) + tone1.flatSharp;
    index2 = SEMITONES.indexOf(tone2.natural) + tone2.flatSharp;
    return (SEMITONES.length + index2 - index1) % SEMITONES.length;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This part of the code handles the HTML page.

const modeNames = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"]

const romNums = ["I  ",
                 "II ",
                 "III",
                 "IV ",
                 "V  ",
                 "VI ",
                 "VII"];

const TONE_SPACE = 4;

let rootNat;
let rootAcc;
let mode;

let scale;

function refresh() {
    rootNat = key_root.value;
    rootAcc = key_acc.value;
    mode = mode_sel.value;
    cc = cc_sel.value;

    scale = (new Scale(new Tone(rootNat, rootAcc), mode)).tones;

    modeDisplay.innerHTML = "";
    toneDisplay.innerHTML = "";
    chrdDisplay.innerHTML = "";

    for (let i = 0; i < scale.length; i++) {
        let modeName = modeNames[(i + (mode - 1)) % modeNames.length];
        let rowTone = scale[i].toString(); 
        
        let modeSpace = "";
        for (let index = 0; index < TONE_SPACE - rowTone.length; index++) {
            modeSpace += " ";
        }

        modeDisplay.innerHTML += "<br>";
        modeDisplay.innerHTML += rowTone + modeSpace + modeName;
        
        // ((n - 1) % 7) + 1
        // This formula with give the desired effect of looping from 1 to 7, even if the given number is out of bounds.
        let modeScale = new Scale(new Tone("C", 0), (1 + (mode - 1) + i % modeNames.length)).tones;
        let intervalText = "";
        let scaleText = "";

        for (let j = 0; j < scale.length; j++) {
            let modeFlatSharp = modeScale[j].flatSharp;
            let accidental = modeFlatSharp < 0 ? "b" : "#";

            let curIvText = "";
            for (let index = 0; index < Math.abs(modeFlatSharp); index++) {
                curIvText += accidental;
            }

            // remove curIvText.length from intervalText before the next piece of text is added.
            let curIvTextLen = curIvText.length;
            for (let index = 0; index < curIvTextLen; index++) {
                intervalText = intervalText.substring(0, intervalText.length - 2) + intervalText.substring(intervalText.length - 1), intervalText.length;
            }

            curIvText += (j + 1) + "   ";

            intervalText += curIvText;

            let toneStr = scale[(i + j) % scale.length].toString(); 
            scaleText += toneStr;
            
            for (let index = 0; index < TONE_SPACE - toneStr.length; index++) {
                scaleText += " ";
            }
        }
        toneDisplay.innerHTML += intervalText + "<br>";
        toneDisplay.innerHTML += scaleText + "<br><br>";

        let root = scale[i];
        let third = scale[(i + 2) % scale.length];
        let fifth = scale[(i + 4) % scale.length];
        let seventh = scale[(i + 6) % scale.length];
        let ninth = scale[(i + 1) % scale.length];
        let eleventh = scale[(i + 3) % scale.length];
        let thirteenth = scale[(i + 5) % scale.length];

        let rootThird = getSemitonesBetween(root, third);
        let rootFifth = getSemitonesBetween(root, fifth);

        let chordName = "?";
                    
        if (rootThird == 3) {
            if (rootFifth == 6) {
                chordName = "dim";
            }
            else if (rootFifth == 7) {
                chordName = "m";
            }
        }
        else if (rootThird == 4) {
            if (rootFifth == 6) {
                chordName = "hrd.dim";
            }
            else if (rootFifth == 7) {
                chordName = "";
            }
            else if (rootFifth == 8) {
                chordName = "aug";
            }
        }
        if (cc >= 1) {
            let rootSeventh = getSemitonesBetween(root, seventh);
            if (rootSeventh == 10) {
                if (chordName == "m") {
                    chordName = "m7";
                }
                else if (chordName == "") {
                    chordName = "7";
                }
                else {
                    chordName += "7";
                }
            }
            else if (rootSeventh == 11) {
                if (chordName == "m") {
                    chordName = "min maj7";
                }
                else if (chordName == "") {
                    chordName = "maj7";
                }
            }
        }
        if (cc >= 2) {
            let rootNinth = getSemitonesBetween(root, ninth);
            if (rootNinth == 1) {
                chordName += " b9";
            }
            else if (rootNinth == 2) {
                chordName += " 9";
            }
        }
        if (cc >= 3) {
            let rootEleventh = getSemitonesBetween(root, eleventh);
            if (rootEleventh == 5) {
                chordName += " 11";
            }
            else if (rootEleventh == 6) {
                chordName += " #11";
            }
        }
        if (cc >= 4) {
            let rootThirteenth = getSemitonesBetween(root, thirteenth);
            if (rootThirteenth == 8) {
                chordName += " b13";
            }
            else if (rootThirteenth == 9) {
                chordName += " 13";
            }
        }

        let chordText = rowTone + chordName;
        chrdDisplay.innerHTML += "<br>";
        chrdDisplay.innerHTML += romNums[i] + " " + chordText;

        if (i < scale.length - 1) {
            modeDisplay.innerHTML += "<br><br>";
            chrdDisplay.innerHTML += "<br><br>";
        }
    }
}
refresh();
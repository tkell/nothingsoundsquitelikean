function info(string) {
    console.log(string)
}

// I am not using a howler.js sound sprite here, 
// as I am going to need to truncate the playback time
// of these sounds to get tempo changes to work.
function loadAudio() {
    var kick = new Howl({urls: ['audio/kick.mp3']})
    var snare = new Howl({urls: ['audio/snare.mp3']})
    var hihat = new Howl({urls: ['audio/hihat.mp3']})
    var rim = new Howl({urls: ['audio/rim.mp3']})
    var cowbell = new Howl({urls: ['audio/cowbell.mp3']})
    return [kick, snare, hihat, rim, cowbell]
}

function sequencePlay(sequence) {

    for (var i = 0; i < sequence.length; i++) {
        sequence[i].play()
    }
}


window.onload = function() {

    sounds = loadAudio()
    var kick = sounds[0]
    var snare = sounds[1]
    var hihat = sounds[2]
    var rim = sounds[3]
    var cowbell = sounds[4]

    var sequence = [kick, snare, cowbell]
    sequencePlay(sequence)

}


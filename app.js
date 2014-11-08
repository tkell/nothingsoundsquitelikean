// I will need to wrap all of these globals in a nice Howler-esq object
var context = null
var tempo = 120
var sequence = []
var playback = false
var currentlyQueued = []

function info(string) {
    console.log(string)
}

function playSound(when, buffer) {
  var source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start(when)
  return source
}

function startSequencer() {
    playback = true
    sequencePlay(sequence, tempo)
}

function stopSequencer () {
    playback = false
    // will need to stop currently queued items...
    for (var i = 0; i < currentlyQueued.length; i++) {
        if (currentlyQueued[i] != null) {
            currentlyQueued[i].stop()
        }
    }
    currentlyQueued = []
}

function sequencePlay(sequence, tempo) {
    var sixteenthNote = 60.0 / tempo / 4.0
    var when = context.currentTime
    for (var i = 0; i < sequence.length; i++) {
        if (playback == false) {
            break
        }
        if (sequence[i] != '') {
            queuedSound = playSound(when, sequence[i])
            currentlyQueued.push(queuedSound)
        }
        when = when + sixteenthNote
    }
    if (playback == true) {
        var totalTime = sixteenthNote * 16 * 1000 // seconds vs milleseconds
        setTimeout(function() {
            sequencePlay(sequence, tempo)
        }, totalTime)
    }
}

window.onload = function() {
    // Load web audio, pass to audioLoaded
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    bufferLoader = new BufferLoader(context,
        ['audio/kick.mp3', 'audio/snare.mp3',
        'audio/hihat.mp3', 'audio/rim.mp3',
        'audio/cowbell.mp3'
        ],
        audioLoaded
    );
    bufferLoader.load();
}

function audioLoaded(bufferList) {
    var kick = bufferList[0]
    var snare = bufferList[1]
    var hihat = bufferList[2]
    var rim = bufferList[3]
    var cowbell = bufferList[4]

    sequence = [snare, '', hihat, '', 
                cowbell, '', hihat, '',
                snare, '', rim, '', 
                cowbell, '', hihat, '' 
               ]
}
function info(string) {
    console.log(string)
}

function playSound(when, buffer) {
  var source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  source.start(when)
}

function sequencePlay(sequence, tempo) {
    var sixteenthNote = 60.0 / tempo / 4.0
    var when = 0
    for (var i = 0; i < sequence.length; i++) {
        if (sequence[i] != '') {
            playSound(when, sequence[i])
        }
        when = when + sixteenthNote
    }
}

window.onload = function() {
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

    var tempo = 120
    sequence = [snare, '', hihat, '', 
                cowbell, '', hihat, '',
                snare, '', rim, '', 
                cowbell, '', hihat, '',  
                ]
    sequencePlay(sequence, tempo)

}
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
    var quarterNote = 60.0 / tempo
    var when = 0
    for (var i = 0; i < sequence.length; i++) {
        playSound(when, sequence[i])
        when = when + quarterNote
    }
}

window.onload = function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    bufferLoader = new BufferLoader(context,
        ['audio/cowbell.mp3','audio/hihat.mp3'],
        audioLoaded
    );
    bufferLoader.load();
}

function audioLoaded(bufferList) {
    var cowbell = bufferList[0]
    var hihat = bufferList[1]

    var tempo = 180
    sequence = [cowbell, hihat, cowbell, hihat]
    sequencePlay(sequence, tempo)

}
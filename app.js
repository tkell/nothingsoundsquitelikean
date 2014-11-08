var seq

function info(string) {
    console.log(string)
}

function updateTempo(event) {
    if (event.keyCode == 13) {
        var tempoText = document.getElementsByClassName('tempoEntry')
        var newTempo = tempoText[0].value
        info(newTempo)
        seq.tempo = parseFloat(newTempo)
    }
}

window.onload = function() {
    // Load web audio, pass to audioLoaded
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    seq = new Sequencer(context, 
        {
            'kick': 'audio/kick.mp3',
            'snare': 'audio/snare.mp3',
            'hihat': 'audio/hihat.mp3',
            'rim': 'audio/rim.mp3',
            'cowbell': 'audio/cowbell.mp3'
        })
}
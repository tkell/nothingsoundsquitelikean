var Sequencer = function(audioContext, audioFiles) {
    var self = this

    self.tempo = 120
    self.steps = 16
    // Test sequences, for now
    self.sequences = {
        'kick': ['kick', '', '', '', 'kick', '', '', '', 'kick', '', '', '', 'kick', '', '', ''],
        'snare': ['', '', '', '', 'snare', '', '', '', '', '', '', '', 'snare', '', '', ''],
        'hihat': ['', '', 'hihat', '', '', '', 'hihat', '', '', '', 'hihat', '', '', '', 'hihat', ''],
        'rim': ['', 'rim', '', 'rim', '', 'rim', '', 'rim', '', '', '', '', '', '', '', ''],
        'cowbell': ['', '', '', '', '', '', '', '', '', '', 'cowbell', '', 'cowbell', '', '', ''],
    }

    // Private things
    var context = audioContext
    var buffers = {}
    var currentlyQueued = []
    var currentCallbacks = []
    var playback = false

    // Load each file
    loadAudio = function(url, soundName) {
        var request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.responseType = 'arraybuffer'
        // Decode asynchronously - I should put in a callback to check
        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                console.log('about to load the data')
                buffers[soundName] = buffer
            }, function() {console.log('Error Loading:  ', request)})
        }
        request.send();
    }
    
    // Actually load the audio files
    for (soundName in audioFiles) {
        buffers[soundName] = null
        var audioPath = audioFiles[soundName]
        loadAudio(audioPath, soundName)
    }

    // User-facing start button
    self.start = function() {
        var self = this;
        playback = true
        sequencePlay(self.sequences.kick, self.tempo, function() {
            console.log('kick')
        })
        sequencePlay(self.sequences.snare, self.tempo, function() {
            console.log('snare')
        })
        sequencePlay(self.sequences.hihat, self.tempo, function() {
            console.log('hi-hat')
        })
        sequencePlay(self.sequences.rim, self.tempo)
        sequencePlay(self.sequences.cowbell, self.tempo)
    }

    // User-facing stop button
    self.stop = function() {
        var self = this
        playback = false
        // Stop queued sounds
        for (var i = 0; i < currentlyQueued.length; i++) {
            if (currentlyQueued[i] != null) {
                currentlyQueued[i].stop()
            }
        }
        currentlyQueued = []

        // Clear queued callbacks
        for (var i = 0; i < currentCallbacks.length; i++) {
            clearTimeout(currentCallbacks[i])
        }
        currentCallbacks = []
    }

    // Master play / loop function
    sequencePlay = function (sequence, tempo, onPlayCallback) {
        var self = this
        var sixteenthNote = 60.0 / tempo / 4.0
        var when = context.currentTime
        for (var i = 0; i < sequence.length; i++) {
            if (playback == false) {
                break
            }
            if (sequence[i] != '') {
                queuedSound = playSound(when, buffers[sequence[i]])
                currentlyQueued.push(queuedSound)
                // Schedule callbacks
                if (typeof(onPlayCallback) != "undefined") {
                    theTime = (when - context.currentTime) *  1000
                    currentCallbacks.push(setTimeout(onPlayCallback, theTime))
                }
            }
            when = when + sixteenthNote
        }

        // Loop
        if (playback == true) {
            var totalTime = sixteenthNote * 16 * 1000
            setTimeout(function() {
                self.sequencePlay(sequence, tempo, onPlayCallback)
            }, totalTime)
        }
    }

    // Raw, strongly-timed WebAudio playback
    playSound = function(when, buffer) {
        var source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.start(when)
        return source
    }
}
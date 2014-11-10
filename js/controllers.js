var sequenceApp = angular.module('sequenceApp', [])

sequenceApp.controller('SequencerControl', function ($scope, $http, $timeout) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    $scope.sequences = {
        'kick': {'name': 'Kick', 'buffer': null, 'displayChar': 'k', 'gain': 1.0,
        'pattern':  ['k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-']
        },
        'snare': {'name': 'Snare', 'buffer': null, 'displayChar': 's', 'gain': 1.0,
        'pattern':  ['-', '-', '-', '-', 's', '-', '-', '-', '-', '-', '-', '-', 's', '-', '-', '-']
        },
        'hihat': {'name': 'Hihat', 'buffer': null, 'displayChar': 'h', 'gain': 0.6,
        'pattern':  ['-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-']
        },
        'rim': {'name': 'Rim', 'buffer': null, 'displayChar': 'r', 'gain': 0.6,
        'pattern':  ['-', 'r', '-', 'r', '-', 'r', 'r', '-', '-', '-', '-', '-', '-', '-', '-', '-']
        },
        'cowbell': {'name': 'Cowbell', 'buffer': null, 'displayChar': 'c', 'gain': 0.5,
        'pattern':  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'c', '-', 'c', '-', '-']
        },
    }

    loadAudio = function(url, track) {
        $http.get(url, {'responseType': 'arraybuffer'}).success(function(data) {
            context.decodeAudioData(data, function(buffer) {
                $scope.sequences[track].buffer = buffer
            }, function() {console.log('Error Loading audio!')})
        })
    }

    loadAudio('audio/kick.mp3', 'kick')
    loadAudio('audio/snare.mp3', 'snare')
    loadAudio('audio/hihat.mp3', 'hihat')
    loadAudio('audio/rim.mp3', 'rim')
    loadAudio('audio/cowbell.mp3', 'cowbell')

    $scope.tempo = 120

    // global, private timer things. 
    var numLoops = 0
    var currentIndex = 0
    var lastIndex = 0

    var visualIndex = -1

    var loopCounter = 0
    var currentlyQueued = []
    var currentCallbacks = []
    var playback = false

    $scope.toggleBeat = function(sequence, index) {
        var letter = sequence.displayChar
        if (sequence.pattern[index] == '-') {
            sequence.pattern[index] = letter
        } else {
            sequence.pattern[index] = '-'
        }
    }

    $scope.start = function() {
        console.log('starting the sequencer')
        playback = true
        schedulePlay(context.currentTime)
    }

    $scope.stop = function() {
        console.log('stopping the sequencer')
        playback = false
        numLoops = 0
        // Stop queued sounds
        for (var i = 0; i < currentlyQueued.length; i++) {
            if (currentlyQueued[i] != null) {
                currentlyQueued[i].stop()
            }
        }
        currentlyQueued = []

        // Clear queued callbacks
        for (var i = 0; i < currentCallbacks.length; i++) {
            $timeout.cancel(currentCallbacks[i])
        }
        currentCallbacks = []
    }

    $scope.checkIndex = function(index) {
        if (visualIndex == index) {
            return true
        } else {
            return false
        }
    }


    schedulePlay = function(startTime) {
        if (playback == false) {
            lastIndex = currentIndex
            return
        }
        var sixteenthNote = 60.0 / $scope.tempo / 4.0 // seconds
        var lookAhead = 0.1 // seconds
        var timeInterval = 30 // milliseconds
        var nextNoteTime = startTime + (numLoops * (240.0 / $scope.tempo)) + ((currentIndex - lastIndex)  * sixteenthNote)
        console.log(context.currentTime, currentIndex, lookAhead, nextNoteTime, numLoops)

        while (nextNoteTime < context.currentTime + lookAhead) {
            for (sequenceName in $scope.sequences) {
                var seq = $scope.sequences[sequenceName]
                if (seq.pattern[currentIndex] != '-') {
                    console.log('we would schedule a note at ', nextNoteTime)
                    queuedSound = playSound(nextNoteTime, seq.buffer, seq.gain)
                    currentlyQueued.push(queuedSound)
                }
            }
            // Increment the overall sequence,
            currentIndex = (currentIndex + 1) % 16

            // Increment each sequence's graphics, on schedule
            var theTime = (nextNoteTime - context.currentTime) *  1000
            $timeout(function() {
                visualIndex = (visualIndex + 1) % 16
            }, theTime)

            // Keep track of where our audio-time loop is
            loopCounter = loopCounter + 1
            if (loopCounter == 16) {
                numLoops = numLoops + 1
                loopCounter = 0
            }

            // Update the tempo
            sixteenthNote = 60.0 / $scope.tempo / 4.0 // seconds
            nextNoteTime = nextNoteTime + sixteenthNote
        }

        // Schedule the next call
        $timeout(function() {
            schedulePlay(startTime)
        }, timeInterval)
    }








    // Master play / loop function
    sequencePlay = function (sequence, onPlayCallback) {
        var sixteenthNote = 60.0 / $scope.tempo / 4.0
        var lookAhead = sixteenthNote - (sixteenthNote / 4)
        var when = context.currentTime

        for (var i = 0; i < sequence.pattern.length; i++) {
            if (playback == false) {
                break
            }
            // Update the sequencer's knowledge of where it is
            var theTime = (when - context.currentTime) *  1000
            var f = angular.bind(self, tick, sequence, i);
            currentCallbacks.push($timeout(f, theTime)) 

            // Play the sound, if any
            if (sequence.pattern[i] != '-') {
                queuedSound = playSound(when, sequence.buffer, sequence.gain)
                currentlyQueued.push(queuedSound)
                // Schedule extra callbacks
                if (typeof(onPlayCallback) != "undefined") {
                    currentCallbacks.push($timeout(onPlayCallback, theTime))
                }
            }
            when = when + sixteenthNote
        }
        // Loop
        if (playback == true) {
            var totalTime = sixteenthNote * 16 * 1000
            $timeout(function() {
                sequencePlay(sequence, onPlayCallback)
            }, totalTime)
        }
    }

    // Raw, strongly-timed WebAudio playback
    playSound = function(when, buffer, gain) {
        var source = context.createBufferSource()
        source.buffer = buffer

        var gainNode = context.createGain();
        gainNode.gain.value = gain;

        source.connect(gainNode);
        gainNode.connect(context.destination);
        
        source.start(when)
        return source
    }

    // Utility to get back an object's keys in the initial order
    $scope.getKeys = function(obj){
        if (!obj) {
            return [];
        }
        return Object.keys(obj)
    }
})
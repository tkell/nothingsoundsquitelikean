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
    // Global transport object for dealing timing
    var transport = {
        'isPlaying': false,
        'currentIndex': 0,
        'oldIndex': 0,
        'visualIndex': -1,
        'numLoops': 0,
        'loopCounter': 0,
        'lookAhead': 0.1, // seconds
        'scheduleInterval': 30, // milliseconds
    }
    
    var currentlyQueued = []
    var currentCallbacks = []

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
        transport.playback = true
        schedulePlay(context.currentTime)
    }

    $scope.stop = function() {
        console.log('stopping the sequencer')
        transport.playback = false
        transport.numLoops = 0
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
        if (transport.visualIndex == index) {
            return true
        } else {
            return false
        }
    }

    function getNextNoteTime(startTime, sixteenthNote) {
        var loopOffset = transport.numLoops * (240.0 / $scope.tempo)
        var indexOffset = (transport.currentIndex - transport.oldIndex)  * sixteenthNote
        return startTime + loopOffset + indexOffset
    }

    schedulePlay = function(startTime) {
        if (transport.playback == false) {
            transport.oldIndex = transport.currentIndex
            return
        }
        var sixteenthNote = 60.0 / $scope.tempo / 4.0 // seconds
        var nextNoteTime = getNextNoteTime(startTime, sixteenthNote)
        while (nextNoteTime < context.currentTime + transport.lookAhead) {
            for (sequenceName in $scope.sequences) {
                var seq = $scope.sequences[sequenceName]
                if (seq.pattern[transport.currentIndex] != '-') {
                    queuedSound = playSound(nextNoteTime, seq.buffer, seq.gain)
                    currentlyQueued.push(queuedSound)
                }
            }
            // Increment the overall sequence,
            transport.currentIndex = (transport.currentIndex + 1) % 16

            // Increment each sequence's graphics, on schedule
            var theTime = (nextNoteTime - context.currentTime) *  1000
            $timeout(function() {
                transport.visualIndex = (transport.visualIndex + 1) % 16
            }, theTime)

            // Keep track of where our audio-time loop is
            transport.loopCounter++
            if (transport.loopCounter == 16) {
                transport.numLoops++
                transport.loopCounter = 0
            }

            // Update the tempo
            sixteenthNote = 60.0 / $scope.tempo / 4.0 // seconds
            nextNoteTime = nextNoteTime + sixteenthNote
        }

        // Schedule the next call
        $timeout(function() {
            schedulePlay(startTime)
        }, transport.scheduleInterval)
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
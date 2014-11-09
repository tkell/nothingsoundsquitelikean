var sequenceApp = angular.module('sequenceApp', [])

sequenceApp.controller('SequencerControl', function ($scope, $http, $timeout) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    $scope.sequences = {
        'kick': {'name': 'Kick', 'buffer': null, 'i': -1, 'displayChar': 'k', 'pattern':  
            ['k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-']
        },
        'snare': {'name': 'Snare', 'buffer': null, 'i': -1, 'displayChar': 's', 'pattern':  
            ['-', '-', '-', '-', 's', '-', '-', '-', '-', '-', '-', '-', 's', '-', '-', '-']
        },
        'hihat': {'name': 'Hihat', 'buffer': null, 'i': -1, 'displayChar': 'h', 'pattern':  
            ['-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-']
        },
        'rim': {'name': 'Rim', 'buffer': null, 'i': -1, 'displayChar': 'r','pattern':  
            ['-', 'r', '-', 'r', '-', 'r', 'r', '-', '-', '-', '-', '-', '-', '-', '-', '-']
        },
        'cowbell': {'name': 'Cowbell', 'buffer': null, 'i': -1, 'displayChar': 'c', 'pattern':  
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'c', '-', 'c', '-', '-']
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
    var buffers = {}
    var currentlyQueued = []
    var currentCallbacks = []
    var playback = false
    var stepStyle = "{color:'red'}"

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
        sequencePlay($scope.sequences.kick)
        sequencePlay($scope.sequences.snare)
        sequencePlay($scope.sequences.hihat)
        sequencePlay($scope.sequences.rim)
        sequencePlay($scope.sequences.cowbell)
    }

    $scope.stop = function() {
        console.log('stopping the sequencer')
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
            $timeout.cancel(currentCallbacks[i])
        }
        currentCallbacks = []
    }

    $scope.checkIndex = function(sequence, index) {
        if (sequence.i == index) {
            return true
        } else {
            return false
        }
    }

    function tick(sequence, index) {
        sequence.i = index
    }

    // Master play / loop function
    sequencePlay = function (sequence, onPlayCallback) {
        var sixteenthNote = 60.0 / $scope.tempo / 4.0
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
                queuedSound = playSound(when, sequence.buffer)
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
    playSound = function(when, buffer) {
        var source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
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
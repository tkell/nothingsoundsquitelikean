var sequenceApp = angular.module('sequenceApp', [])

sequenceApp.controller('SequencerControl', function ($scope, $http) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    $scope.sequences = {
        'kick': {'name': 'Kick', 'buffer':  null, 'pattern':  
            ['k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-']
        },
        'snare': {'name': 'Snare', 'buffer':  null, 'pattern':  
            ['-', '-', '-', '-', 's', '-', '-', '-', '-', '-', '-', '-', 's', '-', '-', '-']
        },
        'hihat': {'name': 'Hihat', 'buffer':  null, 'pattern':  
            ['-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-']
        },
        'rim': {'name': 'Rim', 'buffer':  null, 'pattern':  
            ['-', 'r', '-', 'r', '-', 'r', 'r', '-', '-', '-', '-', '-', '-', '-', '-', '-']
        },
        'cowbell': {'name': 'Cowbell', 'buffer':  null, 'pattern':  
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

    $scope.toggleBeat = function(trackName, index) {
        var track = trackName.toLowerCase()
        var letter = track.charAt(0)
        if ($scope.sequences[track].pattern[index] == '-') {
            $scope.sequences[track].pattern[index] = letter
        } else {
            $scope.sequences[track].pattern[index] = '-'
        }
    }

    $scope.start = function() {
        console.log('starting the sequencer')
        playback = true
        sequencePlay($scope.sequences.kick, function() {
            console.log('kick')
        })
        sequencePlay($scope.sequences.snare, function() {
            console.log('snare')
        })
        sequencePlay($scope.sequences.hihat, function() {
            console.log('hi-hat')
        })
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
            clearTimeout(currentCallbacks[i])
        }
        currentCallbacks = []
    }


    // Master play / loop function
    sequencePlay = function (sequence, onPlayCallback) {
        var sixteenthNote = 60.0 / $scope.tempo / 4.0
        var when = context.currentTime
        for (var i = 0; i < sequence.pattern.length; i++) {
            if (playback == false) {
                break
            }
            if (sequence.pattern[i] != '-') {
                queuedSound = playSound(when, sequence.buffer)
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
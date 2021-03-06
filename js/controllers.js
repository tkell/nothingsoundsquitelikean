var sequenceApp = angular.module('sequenceApp', [])

sequenceApp.controller('SequencerControl', function ($scope, $http, $timeout) {

    // Set up samples and sequences
    $scope.samples = [
        {'name': 'kick', 'displayChar': 'k', 'url': 'audio/kick.mp3'},
        {'name': 'snare', 'displayChar': 's', 'url': 'audio/snare.mp3'},
        {'name': 'hihat', 'displayChar': 'h', 'url': 'audio/hihat.mp3'},
        {'name': 'rim', 'displayChar': 'r', 'url': 'audio/rim.wav'},
        {'name': 'cowbell', 'displayChar':  'c', 'url': 'audio/cowbell.mp3'},
    ]

    $scope.sequences = [
        {'sample': $scope.samples[0], 'gain': 1.0, 'buffer': null,
        'pattern':  ['k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-', 'k', '-', '-', '-']
        },
        {'sample': $scope.samples[1], 'gain': 0.7, 'buffer': null,
        'pattern':  ['-', '-', '-', '-', 's', '-', '-', '-', '-', '-', '-', '-', 's', '-', '-', '-']
        },
        {'sample': $scope.samples[2], 'gain': 0.5, 'buffer': null,
        'pattern':  ['-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-', '-', '-', 'h', '-']
        },
    ]

    $scope.nextSample = $scope.samples[$scope.sequences.length];

    // Create audio context, load audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    loadAudio = function(url, sequence) {
        $http.get(url, {'responseType': 'arraybuffer'}).success(function(data) {
            context.decodeAudioData(data, function(buffer) {
                sequence.buffer = buffer
            }, function() {console.log('Error Loading audio!')})
        })
    }

    for (var i = 0; i < $scope.sequences.length; i++) {
        var sample = $scope.sequences[i].sample
        loadAudio(sample.url, $scope.sequences[i])
    }

    // Global transport object for dealing with timing
    var transport = {
        'tempo':  120,
        'isPlaying': false,
        'currentIndex': 0,
        'oldIndex': 0,
        'visualIndex': -1,
        'numLoops': 0,
        'loopCounter': 0,
        'lookAhead': 0.1, // seconds
        'scheduleInterval': 30, // milliseconds
    }
    
    // Public $scope methods
    $scope.toggleBeat = function(sequence, index) {
        var letter = sequence.sample.displayChar
        if (sequence.pattern[index] == '-') {
            sequence.pattern[index] = letter
        } else {
            sequence.pattern[index] = '-'
        }
    }

    $scope.updateTempo = function(e) {
        if (e.keyCode == 13) {
            var inputTempo = parseInt(e.currentTarget.value)
            var wasPlaying = transport.isPlaying
            if (inputTempo > 0 && inputTempo < 1000) {
                $scope.stop()
                transport.tempo = inputTempo
                // If we wait for a bit here, we don't get the EXPLOSION.
                // Not ideal, but I am out of time.
                if (wasPlaying == true) {
                    $timeout(function() {
                       $scope.start()
                    }, 50)
                }
            } else {
                console.log('Error:  Tempo value out of range')
            }           
        }
    }

    $scope.start = function() {
        transport.isPlaying = true
        schedulePlay(context.currentTime)
    }

    $scope.stop = function() {
        transport.isPlaying = false
        transport.numLoops = 0
    }

    $scope.checkIndex = function(index) {
        if (transport.visualIndex == index) {
            return true
        } else {
            return false
        }
    }

    $scope.addTrack = function() {
        if ($scope.nextSample == null) {
            return
        }
        var newSequence = {
            'sample': $scope.nextSample,
            'gain': 0.7, 
            'buffer': null,
            'pattern':  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
        }   

        $scope.sequences.push(newSequence)
        loadAudio(newSequence.sample.url, newSequence)
    }

    $scope.removeTrack = function(sequence) {
        var index = $scope.sequences.indexOf(sequence)
        $scope.sequences.splice(index, 1)
    }

    // Private functions for playback
    function getNextNoteTime(startTime, sixteenthNote) {
        var loopOffset = transport.numLoops * (240.0 / transport.tempo)
        var indexOffset = (transport.currentIndex - transport.oldIndex)  * sixteenthNote
        return startTime + loopOffset + indexOffset
    }

    schedulePlay = function(startTime) {
        if (transport.isPlaying == false) {
            transport.oldIndex = transport.currentIndex
            return
        }
        // Find the time until the next note
        var sixteenthNote = 60.0 / transport.tempo / 4.0 // seconds
        var nextNoteTime = getNextNoteTime(startTime, sixteenthNote)

        // Schedule the next note or notes using playSound
        while (nextNoteTime < context.currentTime + transport.lookAhead) {
            for (var i = 0; i < $scope.sequences.length; i++) {
                var seq = $scope.sequences[i]
                if (seq.pattern[transport.currentIndex] != '-') {
                    playSound(nextNoteTime, seq.buffer, seq.gain)
                } else if (transport.currentIndex == 0 && transport.numLoops == 0) {
                    // Bootstrap the start:
                    // Web Audio will not start the audioContext timer moving, 
                    // unless we give it something to play.
                    playSound(nextNoteTime, seq.buffer, 0.0)
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
            sixteenthNote = 60.0 / transport.tempo / 4.0 // seconds
            nextNoteTime = nextNoteTime + sixteenthNote
        }

        // Once all notes in this range are added, schedule the next call
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
})

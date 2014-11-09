var sequenceApp = angular.module('sequenceApp', [])

sequenceApp.controller('SequencerControl', function ($scope, $http) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();

    $scope.sequences = {
        'kick': {'name': 'Kick', 'buffer':  null, 'pattern':  
            ['x', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-']
        },
        'snare': {'name': 'Snare', 'buffer':  null, 'pattern':  
            ['-', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-', '-', '-', '-', '-']
        },
        'hihat': {'name': 'Hihat', 'buffer':  null, 'pattern':  
            ['-', '-', 'x', '-', '-', '-', 'x', '-', '-', 'x', '-', '-', '-', 'x', '-', '-']
        },
        'rim': {'name': 'Rim', 'buffer':  null, 'pattern':  
            ['-', 'x', '-', 'x', '-', '-', '-', '-', 'x', '-', '-', '-', '-', '-', '-', '-']
        },
        'cowbell': {'name': 'Cowbell', 'buffer':  null, 'pattern':  
            ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'x', '-', 'x', '-', '-']
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
    var steps = 16
    var buffers = {}
    var currentlyQueued = []
    var currentCallbacks = []
    var playback = false

    $scope.toggleBeat = function(trackName, index) {
        var track = trackName.toLowerCase()
        if ($scope.sequences[track].pattern[index] == 'x') {
            $scope.sequences[track].pattern[index] = '-'
        } else {
            $scope.sequences[track].pattern[index] = 'x'
        }
    }

    $scope.start = function() {
        console.log('starting the sequencer')
    }

    $scope.stop = function() {
        console.log('stopping the sequencer')
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
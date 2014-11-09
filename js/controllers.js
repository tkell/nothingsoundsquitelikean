var sequenceApp = angular.module('sequenceApp', [])

// It would feel angular to make five Sequences,
// and then attach each Sequence to a Sequencer.
// Each Sequence has a name and a pattern and some way of pointing to the buffer
sequenceApp.controller('SequencerControl', function ($scope) {

    $scope.tempo = 120

    $scope.sequences = {
    'kick': {'name': 'Kick', 'sound':  'audio/kick.mp3', 'pattern':  
        ['x', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-']
    },
    'snare': {'name': 'Snare', 'sound':  'audio/snare.mp3', 'pattern':  
        ['-', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-', '-', '-', '-', '-']
    },
    'hihat': {'name': 'Hihat', 'sound':  'audio/hihat.mp3', 'pattern':  
        ['-', '-', 'x', '-', '-', '-', 'x', '-', '-', 'x', '-', '-', '-', 'x', '-', '-']
    },
    'rim': {'name': 'Rim', 'sound':  'audio/rim.mp3', 'pattern':  
        ['-', 'x', '-', 'x', '-', '-', '-', '-', 'x', '-', '-', '-', '-', '-', '-', '-']
    },
    'cowbell': {'name': 'Cowbell', 'sound':  'audio/cowbell.mp3', 'pattern':  
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'x', '-', 'x', '-', '-']
    },
    }

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

    // Utility to get back an object's keys in the initial order
    $scope.getKeys = function(obj){
        if (!obj) {
            return [];
        }
        return Object.keys(obj)
    }
})
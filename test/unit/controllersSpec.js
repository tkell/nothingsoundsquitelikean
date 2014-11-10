describe('SequencerControl', function() {
    var scope

    // Set up
    beforeEach(angular.mock.module('sequenceApp'))  
    beforeEach(inject(function($controller, $rootScope){    
        scope = $rootScope.$new()
        $controller('SequencerControl', {$scope:scope})
    }))

    // Tests for turning beats on and off
    it('should toggle beats off', function() {
        var index = 0
        scope.sequences[0].pattern[index] = 'k'
        scope.toggleBeat(scope.sequences[0], index)
        expect(scope.sequences[0].pattern[index]).toBe('-')
    })
    it('should toggle beats on, with the letter for the sequence', function() {
        var index = 0
        var displayChar = scope.sequences[0].sample.displayChar
        scope.sequences[0].pattern[index] = '-'
        scope.toggleBeat(scope.sequences[0], index)
        expect(scope.sequences[0].pattern[index]).toBe(displayChar)
    })

    // Tests for adding tracks
    it('should add a track to the sequence', function() {
        var numTracks = scope.sequences.length
        scope.nextSample = scope.samples[0]
        scope.addTrack()
        expect(scope.sequences.length).toBe(numTracks + 1)
    })

    it('should give the new track various attributes', function() {
        scope.nextSample = scope.samples[0]
        var displayChar = scope.nextSample.displayChar
        var trackName = scope.nextSample.name

        scope.addTrack()

        var trackIndex = scope.sequences.length - 1
        expect(scope.sequences[trackIndex].sample).toBe(scope.nextSample)
        expect(scope.sequences[trackIndex].gain).toBe(0.7)
        expect(scope.sequences[trackIndex].pattern.length).toBe(16)
    })

    // Tests for removing tracks
    it('should remove a track from the sequence', function() {
        var numTracks = Object.keys(scope.sequences).length
        scope.removeTrack('kick')
        expect(Object.keys(scope.sequences).length).toBe(numTracks -1)
    })


    // From here, we have a problem:  Angular does not like the idea of testing private methods,
    // nor does it like providing access to private variables like my transport.
    // The Angular philosophy would be to test what those private methods *do*. 
    // But in this case, that involves checking the actual audio output, 
    // which I do not think is actually possible.  

    // I can either expose my private data and methods through $scope._private, 
    // or add callbacks on the client side to test things, or make everthing public.  
    // None of those seem amazing.

    // I would like to test:

    // - that updateTempo works, 
    // - that the bounds on tempos work, 
    // - and that bad input is deal with.

    // - that start and stop actually start and stop the sequencer

    // - that checkIndex works

    // - that getNextNoteTime does the correct thing

    // - that the audio will load

    // - That raw audio playback works

    // - That schedulePlay works.
    // - That looping workins
    // - That pausing / restarting works
    // - That changing the volume works
})
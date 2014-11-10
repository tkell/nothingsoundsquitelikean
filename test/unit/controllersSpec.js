describe('SequencerControl', function(){
    var scope

    beforeEach(angular.mock.module('sequenceApp'))  
    beforeEach(inject(function($controller, $rootScope){    
        scope = $rootScope.$new()
        $controller('SequencerControl', {$scope:scope})
    }))

    // Tests for toggleBeats
    it('should toggle beats off', function() {
        var index = 0
        scope.sequences.kick.pattern[index] = 'k'
        scope.toggleBeat(scope.sequences.kick, index)
        expect(scope.sequences.kick.pattern[index]).toBe('-')
    })
    it('should toggle beats on, with the letter for the sequence', function() {
        var index = 0
        var displayChar = scope.sequences.kick.displayChar
        scope.sequences.kick.pattern[index] = '-'
        scope.toggleBeat(scope.sequences.kick, index)
        expect(scope.sequences.kick.pattern[index]).toBe(displayChar)
    })

    // Tests for adding / removing tracks will go here

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
    // - and that garbage input is deal with.

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
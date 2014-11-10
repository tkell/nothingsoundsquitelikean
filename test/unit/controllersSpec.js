describe('SequencerControl', function(){

    var scope;
    
    beforeEach(angular.mock.module('sequenceApp'));   
    beforeEach(inject(function($controller, $rootScope){    
        scope = $rootScope.$new()
        $controller('SequencerControl', {$scope:scope})
    }))

    it('should have a length of sixteen', function() {
        expect(scope.sequences.kick.pattern.length).toBe(16)
    })
   
})
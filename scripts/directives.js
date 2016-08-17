'use strict';

/* Directives */

var appDirectives = angular.module('appDirectives', [])
    .directive('elementInput', function () {

        var controller = ['$scope', 'iRoadModal', '$http', function ($scope, iRoadModal, $http) {
            function getDayClass(data) {
                var date = data.date,
                    mode = data.mode;
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                    for (var i = 0; i < $scope.events.length; i++) {
                        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }
            }

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }
            //iRoadModal.getDataElementByName($scope.ngDataElementName).then(function (dataElement) {
            $scope.dataElement = $scope.ngProgramStageDataElement.dataElement;
            if ($scope.dataElement.valueType == "DATE") {

                $scope.inlineOptions = {
                    customClass: getDayClass,
                    minDate: new Date(),
                    showWeeks: true
                };

                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };

                $scope.toggleMin = function () {
                    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                };

                $scope.toggleMin();

                $scope.open1 = function () {
                    $scope.popup1.opened = true;
                };

                $scope.open2 = function () {
                    $scope.popup2.opened = true;
                };

                $scope.setDate = function (year, month, day) {
                    $scope.dt = new Date(year, month, day);
                };

                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.altInputFormats = ['M!/d!/yyyy'];

                $scope.popup1 = {
                    opened: false
                };

                $scope.popup2 = {
                    opened: false
                };

                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                var afterTomorrow = new Date();
                afterTomorrow.setDate(tomorrow.getDate() + 1);
                $scope.events = [
                    {
                        date: tomorrow,
                        status: 'full'
                    },
                    {
                        date: afterTomorrow,
                        status: 'partially'
                    }
                ];
            }
            else if ($scope.dataElement.name.startsWith(iRoadModal.refferencePrefix)) {
                $scope.relation = {
                    loading:true,
                    relationships:[],
                    data:[],
                    searchRelations:function(value){
                        this.feedback = {status:"LOADING"};
                        var self = this;
                        return iRoadModal.get($scope.dataElement.name.replace(iRoadModal.refferencePrefix,""),
                            {filter:{left:this.dataElement.id,operator:"LIKE",right:value}}).then(function(results){
                            self.feedback = {};
                            self.data = results;
                        })
                    },
                    setDataElement:function(dataElementName){
                        this.feedback = {status:"LOADING"};
                        var self = this;
                        iRoadModal.getRelationship(dataElementName).then(function(dataElement){
                            self.dataElement = dataElement;
                            iRoadModal.getProgramByName(dataElementName.replace(iRoadModal.refferencePrefix,"")).then(function(program){
                                program.programStages[0].programStageDataElements.forEach(function(programStageDataElement){
                                    if(programStageDataElement.dataElement.name.startsWith(iRoadModal.refferencePrefix)){
                                        alert("Here");
                                        self.relationships.push(programStageDataElement);
                                    }
                                })
                                self.feedback = {};
                            })
                        })
                    }
                }
                //console.log();
                $scope.relation.setDataElement($scope.dataElement.name)
            }
        }];
        return {
            restrict: 'AEC',
            require: '^form',
            scope: {
                //actions:actions,
                ngModel: '=',
                crudOperation: '=',
                ngProgramStageDataElement: '='
            },
            controller: controller,
            templateUrl: 'views/directives/elementInput.html'
        };
    })

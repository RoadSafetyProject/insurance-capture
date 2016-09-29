/* global angular */

'use strict';

/* Controllers */
var appControllers = angular.module('appControllers', ['iroad-relation-modal'])

    .controller('MainController', function (NgTableParams,iRoadModal, $scope,$uibModal,$log,$timeout) {

        $scope.loading = true;
        $scope.pager ={pageSize:10};

        $scope.programName = "Insurance Company";

        function createColumns(programStageDataElements) {
            var cols = [];
            if (programStageDataElements){
                programStageDataElements.forEach(function (programStageDataElement) {
                    var filter = {};
                    filter[programStageDataElement.dataElement.name.replace(" ","")] = 'text';
                    cols.push({
                        field: programStageDataElement.dataElement.name.replace(" ",""),
                        title: programStageDataElement.dataElement.name,
                        headerTitle: programStageDataElement.dataElement.name,
                        show: programStageDataElement.displayInReports,
                        sortable: programStageDataElement.dataElement.name.replace(" ",""),
                        filter: filter
                    });
                })
            }
            cols.push({
                field: "",
                title: "Action",
                headerTitle: "Action",
                show: true
            });
            return cols;
        }

        /**
         * getInsuranceCompanies
         */
        dhis2.loadData = function(){
            $scope.tableParams = new NgTableParams({count:$scope.pager.pageSize}, {
                getData: function(params) {
                    $scope.pager.page = params.page();
                    // ajax request to api
                    return iRoadModal.getProgramByName($scope.programName).then(function(program){
                        $scope.program = program;
                        $scope.tableCols = createColumns(program.programStages[0].programStageDataElements);
                        return iRoadModal.getAll($scope.programName,$scope.pager).then(function(results){
                            $scope.pager = results.pager;
                            params.page($scope.pager.page)
                            params.total($scope.pager.total);
                            $timeout(function(){
                                $scope.loading = false;
                            });
                            return results.events;
                        })

                    })
                }
            });
        };
        function getInsuranceCompanies(){
            iRoadModal.getAll($scope.programName,$scope.params).then(function(results){
                $scope.tableParams.settings({
                    dataset: results
                });
                $scope.loading = false;
                iRoadModal.getProgramByName($scope.programName).then(function(program){
                    $scope.program = program;
                    $scope.tableCols = createColumns(program.programStages[0].programStageDataElements);

                })
            })
        }


        /**
         * showDetails
         * @param event
         */
        $scope.showDetails = function(event){
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/details.html',
                controller: 'DetailController',
                size: "sm",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    }
                }
            });

            modalInstance.result.then(function (event) {
                iRoadModal.setRelations(event).then(function(){
                });
            }, function () {
                iRoadModal.setRelations(event).then(function(){
                });
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * showEdit
         * @param event
         */
        $scope.showEdit = function(event){
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/addedit.html',
                controller: 'EditController',
                size: "sm",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    }
                }
            });

            modalInstance.result.then(function (resultEvent) {
                $scope.tableParams.data.forEach(function(event){
                    if(event.event == resultEvent.event){
                        Object.keys(event).forEach(function(key){
                            event[key] = resultEvent[key];
                        })

                    }
                });
                $scope.tableParams.reload();
            }, function () {
                iRoadModal.setRelations(event).then(function(){
                });
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        /**
         * showAddNew
         */
        $scope.showAddNew = function(){
            var event = {};
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/addedit.html',
                controller: 'EditController',
                size: "sm",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    }
                }
            });

            modalInstance.result.then(function (resultEvent) {
                if(resultEvent && resultEvent.event){
                    $scope.tableParams.data.push(resultEvent);
                }
            }, function () {
            });
        }
    })
    .controller('DetailController', function (iRoadModal, $scope,$uibModalInstance,program,event) {
        $scope.loading = true;
        $scope.program = program;

        iRoadModal.getRelations(event).then(function(newEvent){
            $scope.event = newEvent;
            $scope.loading = false;
        });

        $scope.ok = function () {
            $uibModalInstance.close(event);
        };

        $scope.cancel = function () {
            $uibModalInstance.close(event);
        };
    })
    .controller('EditController', function (NgTableParams,iRoadModal, $scope,$uibModalInstance,program,event,toaster,DHIS2EventFactory) {
        $scope.program = program;

        iRoadModal.initiateEvent(event,program).then(function(newEvent){
            $scope.event = newEvent;
            $scope.loading = false;
            $scope.getDataElementIndex = function(dataElement){
                var index = "";
                $scope.event.dataValues.forEach(function(dataValue,i){
                    if(dataValue.dataElement == dataElement.id){
                        index = i;
                    }
                });
                return index;
            }
        });


        $scope.save = function () {
            $scope.loading = true;
            iRoadModal.save($scope.event,$scope.program).then(function(result){
                $scope.loading = false;
                $uibModalInstance.close(result);
            },function(error){
                $scope.loading = false;
            });
        };

        $scope.cancel = function () {
            iRoadModal.setRelations($scope.event).then(function(event){
                $uibModalInstance.close(event);
            })
        };
    });

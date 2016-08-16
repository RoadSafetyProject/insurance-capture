/* global angular */

'use strict';

/* Controllers */
var appControllers = angular.module('appControllers', ['iroad-relation-modal'])

    .controller('MainController', function (NgTableParams,iRoadModal, $scope,$uibModal,$log) {
        $scope.loading = true;
        $scope.tableParams = new NgTableParams();
        $scope.params ={pageSize:5};
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
        getInsuranceCompanies();

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

            modalInstance.result.then(function (resultItem) {

            }, function () {
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
                size: "lg",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    },
                    modalAction: function(){
                        return "edit"
                    }
                }
            });

            modalInstance.result.then(function (resultItem) {
                for(var key in event){
                    event[key] = resultItem[key];
                }
            }, function () {
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
                size: "lg",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    },
                    modalAction: function(){
                        return "add"
                    }
                }
            });

            modalInstance.result.then(function (resultItem) {
                for(var key in event){
                    event[key] = resultItem[key];
                }
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    })
    .controller('DetailController', function (iRoadModal, $scope,$uibModalInstance,program,event) {
        $scope.loading = true;
        iRoadModal.getRelations(event).then(function(newEvent){
            $scope.event = newEvent;
            $scope.loading = false;
        })
        $scope.program = program;
        console.log(program.programStages[0].programStageDataElements);
        $scope.ok = function () {
            $uibModalInstance.close({});
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('EditController', function (NgTableParams,iRoadModal,DHIS2EventFactory, $scope,$uibModalInstance,program,event,modalAction,toaster) {
        $scope.modalAction = modalAction;
        $scope.program = program;

        /**
         * getDataElementIndex
         * @param dataElement
         * @returns {string}
         */
        $scope.getDataElementIndex = function(dataElement){
            var index = "";
            event.dataValues.forEach(function(dataValue,i){
                if(dataValue.dataElement == dataElement.id){
                    index = i;
                }
            });
            return index;
        };


        if(event.dataValues){
            iRoadModal.getRelations(event).then(function(newEvent){
                $scope.event = newEvent;
                $scope.loading = false;
            });
        }else{
            //event.dataValues = {};
            $scope.event = event;
        }


        //todo update list on update
        $scope.save = function () {
            $scope.loading = true;
            if(modalAction == "edit"){
                delete $scope.event.href;
                iRoadModal.setRelations($scope.event).then(function(DHIS2Event){
                    DHIS2EventFactory.update(DHIS2Event).then(function(results){
                        $scope.loading = false;
                        toaster.pop('success', results.response.status, results.message);
                        $uibModalInstance.close($scope.event);
                    },function(error){
                        $scope.loading = false;
                        console.log(error);
                        toaster.pop('error', error.status, error.statusText);
                    })
                });
            }
            else{
                toaster.pop('info', "Add new " + program.displayName, "On  progress");
                $scope.loading = false;
                $uibModalInstance.close($scope.event);
            }

        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
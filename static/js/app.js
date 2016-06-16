/*Define Module*/
var app = angular.module('app', [
    'ngRoute', 'ngSanitize'/*ngroute for routing and ngSanitize for sanitizing unsafe values to show error message*/
]);

/*provide routes*/
app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
                when('/home', {
                    templateUrl: 'static/partials/homepage.html',
                    controller: 'mainCtrl'
                }).
                otherwise({
                    redirectTo: '/home'
                });
    }]);

/*Define Controller*/
app.controller('mainCtrl', function ($scope, $http) {
    /*Define variables*/
    $scope.actualData = [];
    $scope.presentData = [];
    $scope.headMsg = '';
    $scope.expireTime;
    //--------------------------------------------------------------------------
    /**
     * Send request to get data from json file
     */
    $http({
        method: "GET",
        url: "data.json"
    }).then(function mySuccess(response) {
        if (response.status == 200) {
            /*actual data*/
            $scope.actualData = response.data;
            /*Sort data with time */
            $scope.actualData.sort(function (a, b) {
                return new Date(a.expiry) - new Date(b.expiry);
            })
            /*create present data array*/
            angular.forEach($scope.actualData, function (value, key) {
                /*Compare expiry time of messages with curent time and take the message which are not expired*/
                if (new Date(value.expiry) > new Date()) {
                    $scope.presentData.push(value);
                }
            });
            /*call function to check next expiration date and expire that */
            checkForExpiration();
        } else {
            /*Show error mesasge*/
            $scope.headMsg = "<div class='alerts alert alert-danger fade in'>\n\
                        <strong>No Messages to Show</strong></div>";
        }
    }, function myError(response) {
        /*Show error mesasge*/
        $scope.headMsg = "<div class='alerts alert alert-danger fade in'>\n\
                        <strong>No Messages to Show</strong></div>";
    });

    //--------------------------------------------------------------------------
    /**
     * Function to check when to remove  expired data
     * 
     */
    function checkForExpiration() {
        /*Check only if we data exists otherwise show error*/
        if ($scope.presentData.length > 0) {
            /*get next expiration time*/
            $scope.nextExpiryTime = new Date($scope.presentData[0]['expiry']).getTime();
            /*Get next expiration duration from now*/
            $scope.expireTime = $scope.nextExpiryTime - Date.now();
            /*Call function to removed expired data after the expiration duration*/
            setTimeout(function () {
                removeExpired();
            }, $scope.expireTime);

        } else {
            $scope.headMsg = "<div class='alerts alert alert-danger fade in'>\n\
                        <strong>No Messages to Show</strong></div>";
        }

    }
    //--------------------------------------------------------------------------
    /**
     * Function to remove expired data
     * 
     */
    function removeExpired() {
        $scope.currentData = [];/*local variable to save current unexpired data*/
        angular.forEach($scope.presentData, function (value, key) {
            /*Compare expiry time of messages with curent time and take the message which are not expired*/
            if (new Date(value.expiry) > new Date()) {
                $scope.currentData.push(value);
            }
        });
        /*Assign current data to present data as we need unexpired data*/
        $scope.presentData = $scope.currentData;
        /*Apply changes in present data so that it will reflect in UI*/
        $scope.$apply();
        /*Once we remove the expired data, check for next expiration time */
        checkForExpiration();
    }
});

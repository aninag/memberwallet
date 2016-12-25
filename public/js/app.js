
var myapp = angular.module("contactsApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    contacts: function(Contacts) {
                        return Contacts.getContacts();
                    }
                }
            })
            .when("/new/contact", {
                controller: "NewContactController",
                templateUrl: "contact-form.html"
            })
            .when("/contact/:contactId", {
                controller: "EditContactController",
                templateUrl: "contact.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Contacts", function($http) {
        this.getContacts = function() {
            return $http.get("/contacts").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding contacts.");
                });
        }
        this.createContact = function(contact) {
            return $http.post("/contacts", contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating contact.");
                });
        }
        this.getContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this contact.");
                });
        }
        this.editContact = function(contact) {
            var url = "/contacts/" + contact._id;
            console.log(contact._id);
            return $http.put(url, contact).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this contact.");
                    console.log(response);
                });
        }
        this.deleteContact = function(contactId) {
            var url = "/contacts/" + contactId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this contact.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(contacts, $scope) {
        $scope.contacts = contacts.data;
    })
    .controller("NewContactController", function($scope, $location, Contacts) {
        $scope.back = function() {
            $location.path("#/");
        }
        $scope.init = function () {
            $scope.editMode = false;
            //alert("Hi "+$scope.editMode);
        }

        $scope.saveContact = function(contact) {
            Contacts.createContact(contact).then(function(doc) {
                var contactUrl = "/contact/" + doc.data._id;
                $location.path(contactUrl);
            }, function(response) {
                alert(response);
            });
        }

    })
    .controller("EditContactController", function($scope, $routeParams, Contacts) {
        Contacts.getContact($routeParams.contactId).then(function(doc) {
            $scope.contact = doc.data;
            //$scope.contact.memexpiry = $filter('date')(new Date($scope.contact.memexpiry), "dd/MM/yyyy");
            $scope.contactFormUrl = "contact-form.html";
        }, function(response) {
            alert(response);
        });

        $scope.$on('$viewContentLoaded', function() {
            $scope.editMode = true;
            //alert("hi");
        })

        $scope.toggleEdit = function() {
            //$scope.editMode = !$scope.editMode;
                    if ($('.editField').is('[readonly]')) { //checks if it is already on readonly mode
                        $('.editField').prop('readonly', false);//turns the readonly off
                        $('.editBtn').html('Edit On'); //Changes the text of the button
                        $('.editBtn').css("background", "green"); //changes the background of the button
                        $('.editBtn').css("border", "green"); //changes the border of the button
                        $("input[type=radio]").attr('disabled', false);
                        $("select[name=state]").attr('disabled', false);
                    } else { //else we do other things
                        $('.editField').prop('readonly', true);
                        $('.editBtn').html('Edit Off');
                        $('.editBtn').css("background", "red");
                        $("input[type=radio]").attr('disabled', true);
                        $("select[name=state]").attr('disabled', true);
                    }

           // $scope.contactFormUrl = "contact-form.html";
        }

        $scope.back = function() {
            //$scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.saveContact = function(contact) {
            Contacts.editContact(contact);
            //$scope.editMode = false;
            $scope.contactFormUrl = "";
        }

        $scope.deleteContact = function(contactId) {
            Contacts.deleteContact(contactId);
        }

    })
    .service('googleService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
    var clientId = '{CLIENT_ID}',
        apiKey = '{API_KEY}',
        scopes = '{SCOPES}',
        domain = '{OPTIONAL DOMAIN}',
        deferred = $q.defer();

    this.login = function () {
        gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: false,
            hd: domain
        }, this.handleAuthResult);

        return deferred.promise;
    }

    this.handleClientLoad = function () {
        gapi.client.setApiKey(apiKey);
        gapi.auth.init(function () { });
        window.setTimeout(checkAuth, 1);
    };

    this.checkAuth = function() {
        gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: true,
            hd: domain
        }, this.handleAuthResult);
    };

    this.handleAuthResult = function(authResult) {
        if (authResult && !authResult.error) {
            var data = {};
            gapi.client.load('oauth2', 'v2', function () {
                var request = gapi.client.oauth2.userinfo.get();
                request.execute(function (resp) {
                    data.email = resp.email;
                });
            });
            deferred.resolve(data);
        } else {
            deferred.reject('error');
        }
    };

    this.handleAuthClick = function(event) {
        gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: false,
            hd: domain
        }, this.handleAuthResult);
        return false;
    };

}]);



myapp.filter('dateFormat', function($filter)
{
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input), 'MMM dd yyyy');

        return _date.toUpperCase();

    };
});
myapp.filter('dateFormat1', function($filter)
{
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input), 'MM/dd/yyyy');

        //alert(_date);

        return _date.toUpperCase();

    };
});

myapp.filter('time', function($filter)
{
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input), 'HH:mm:ss');

        return _date.toUpperCase();

    };
});
myapp.filter('datetime', function($filter)
{
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input),
            'MMM dd yyyy - HH:mm:ss');

        return _date.toUpperCase();

    };
});
myapp.filter('datetime1', function($filter)
{
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input),
            'MM dd yyyy - HH:mm:ss');

        return _date.toUpperCase();

    };
});

var app = angular.module("predictr", ['ui.router', 'firebase', 'ngDialog', 'ui.bootstrap', 'angular.filter', 'angularUtils.directives.dirDisqus']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    //
    $locationProvider.hashPrefix('!');
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/login");
    //
    // Redirect when not logged in
    var redirectNotLoggedIn = function ($state, $rootScope, $stateParams) {
        if ($rootScope.authData === (null || undefined)) {
            $state.go('login');
        }
    };
    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "partials/LogedIn.html",
            controller: "homeCtrl",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)
            }]
        })
        .state('editProfile', {
            url: '/editProfile',
            templateUrl: 'partials/EditProfile.html',
            controller: "editProfileController",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)

            }]
        })
        .state('editProfile.showChanges', {
            url: '/showChanges',
            templateUrl: 'partials/showChangesProfile.html',
            controller: "editProfileController",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)

            }]
        })
        .state('lookProfile', {
            url: '/lookProfile',
            templateUrl: 'partials/lookProfile.html',
            controller: "lookProfileCtrl",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)

            }]
        })
        .state('findPerson', {
            url: "/findPerson",
            templateUrl: "partials/findPerson.html",
            controller: "PredictionCtrl"
        })
        .state('findPerson.addPrediction', {
            url: "/addPrediction",
            templateUrl: "partials/AddPrediction.html",
            controller: "PredictionCtrl",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)
            }]
        })
        .state('findPerson.listPredictions', {
            url: "/listPrediction?userId",
            templateUrl: "partials/listPredictions.html",
            controller: "PredictionCtrl"
        })
        .state('findPerson.editPerson', {
            url: "/editPerson",
            templateUrl: "partials/EditPerson.html",
            controller: "PersonCtrl",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)
            }]
        })
        .state('addPerson', {
            url: "/addPerson",
            templateUrl: "partials/AddPerson.html",
            controller: "PersonCtrl",
            onEnter: ['$state', '$rootScope', '$stateParams', function ($state, $rootScope, $stateParams) {
                redirectNotLoggedIn($state, $rootScope, $stateParams)
            }]
        })
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html",
            controller: "loginCtrl"
        })
        .state('ratePrediction', {
            url: "/ratePrediction",
            templateUrl: "partials/RateAPrediction.html",
            controller: "ratePredictionCtrl"
        });
});

app.directive("chooseCategory", ['ngDialog', function (ngDialog) {
    return {
        restrict: "E",
        templateUrl: "partials/directives/chooseCategory.html",
        link: function (scope) {
            scope.addCateg = function () {
                ngDialog.open({
                    template: '/dialogs/addCateg.html'
                });
            };
            scope.mainCategs = [
                {
                    name: "Politics",
                    subCategs: ["Economics", "Agrar", "Security"]
        },
                {
                    name: "Economics",
                    subCategs: ["Gold", "Silver", "Platin", "Fonds"]
        },
                {
                    name: "Institutes",
                    subCategs: ["Fresenitus", "PWC", "Kinsey"]
        }

    ];
            scope.mainCateg = "";
            scope.subCateg = "";
            scope.subCategs = scope.mainCategs[0].subCategs;
            //$scope.categ3 = $scope.categ1;
            scope.setMainCateg = function (categName) {
                scope.mainCateg = categName;
                scope.mainCategs.forEach(function (categ) {
                    if (categ.name === categName) {
                        scope.subCategs = categ.subCategs;
                    }
                });
            };
            scope.setSubCateg = function (categName) {
                scope.subCateg = categName;
            };

        }
    }
}]);

app.directive('ngEnter', function ($state, $rootScope) {
    return {
        link: function (scope, elements, attrs) {
            elements.bind('keydown keypress', function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                        $state.go("findPerson.listPredictions");
                        $rootScope.$broadcast("personSearched", scope.selected);
                    });
                    event.preventDefault();
                }
            });
        }
    };
});



app.controller("main", function ($scope, $rootScope, $state) {
    $scope.selected = undefined;
    $scope.states = [];
    var ref = new Firebase("https://predictr.firebaseio.com/persAndComp/");
    ref.on("value", function (data) {
        $scope.states = [];
        for (var obj in data.val()) {
            ref.child(obj).orderByChild("name").on("value", function (data2) {
                $scope.states.push(data2.val().name);
            });
        }
    });

    $scope.loggedIn = false;
    $scope.$on("loggedIn", function (event, val) {
        $scope.loggedIn = val;
        if ($scope.loggedIn === true) {
            $state.go('home');
        }
    });

    $scope.$on("setAuthData", function (event, data) {
        $rootScope.authData = data;
    });
    if ($scope.loggedIn === false) {
        $state.go('login');
    }
});

app.controller("homeCtrl", function ($scope) {});
app.controller("editProfileController", function ($scope, $rootScope, $firebaseObject, $firebase) {
    var ref = new Firebase("https://predictr.firebaseio.com/users/" + $rootScope.authData.uid);
    var syncObj = $firebaseObject(ref);
    syncObj.$bindTo($scope, "profile");
    var refImg = new Firebase("https://predictr.firebaseio.com/profileImages/" + $rootScope.authData.uid);
    var ImgObj = $firebaseObject(refImg);
    var controller = this;

    function saveimage(e1) {
        var filename = e1.target.files[0];
        var fr = new FileReader();
        fr.onload = function (res) {
            $scope.image = res.target.result;
            ImgObj.image = res.target.result;
            ImgObj.$save().then(function (val) {
                controller.loadimage();
            }, function (error) {
                console.log("ERROR", error);
            })
        };
        fr.readAsDataURL(filename);
    }

    document.getElementById("file-upload").addEventListener('change', saveimage, false);

    this.loadimage = function () {
        ImgObj.$loaded().then(function (obj) {
            $scope.profileImage = obj.image;
            document.getElementById("profileImage").src = obj.image;
        }, function (error) {
            console.log("ERROR", error);
        });
    };
    this.loadimage();

    $scope.loadChanges = function () {
        $scope.persons = [];
        for (var i in $scope.profile.changes) {
            $scope.persons.push({
                name: $scope.profile.changes[i].person,
                changes: JSON.stringify($scope.profile.changes[i])
            });
        }
    };

});
app.controller("PredictionCtrl", function ($scope, ngDialog, $firebaseArray, $state, $rootScope, $firebaseObject, $stateParams) {
    if ($stateParams.userId !== undefined) {
        var ref = new Firebase("https://predictr.firebaseio.com/persAndComp/" + $stateParams.userId);
        var obj = new $firebaseObject(ref);
        obj.$loaded().then(function (data) {
            $scope.person = data;
        });
        ref = new Firebase("https://predictr.firebaseio.com/persAndCompImages/" + $stateParams.userId);
        var iobj = new $firebaseObject(ref);
        iobj.$loaded().then(function () {
            $scope.image = iobj.image;
        });
    }


    //Fetch Article from links
    $scope.fetchArticle = function () {
        var source = "http://www.golem.de/news/kepler-452b-die-zweite-erde-die-schon-wieder-keine-ist-1507-115406.html";
        var encodedSource = encodeURI(source);
        console.log("encodedSource", encodedSource);
        var googleRequest = "https://www.google.ru/gwt/x?u=" + encodedSource;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", googleRequest, false);
        xmlHttp.send(null);
        var text = xmlHttp.responseText;
        console.log("text", text);
        var headline = text.substring(0, 15);
        var body = text.substring(15, 50);
        console.log("headline", headline);
        console.log("body", body);
    }

    //Filter Predictionslist
    $scope.predictionFilter = function (prediction) {
        console.log("FILTER");
        if ($scope.selectedCityId === undefined || $scope.selectedCityId.length === 0) {
            return true;
        }

        var found = false;
        if (prediction.prediction.description.search($scope.predFilterText) !== -1) {
            found = true
        }

        return found;
    };
    //If search triggered fill $scope
    $scope.$on("personSearched", function (event, data) {
        var ref = new Firebase("https://predictr.firebaseio.com/persAndComp/");
        ref.orderByChild("name").equalTo(data).on("value", function (snapshot) {
            for (i in snapshot.val()) {
                $scope.person = snapshot.val()[i];
            }
        });
    });
    //Category stuff
    $scope.persons = [];
    $scope.$watch("subCateg", function (newValue, oldValue) {
        try {
            if (newValue !== undefined) {
                var ref = new Firebase("https://predictr.firebaseio.com/persAndComp");
                ref.orderByChild("subCateg").equalTo(newValue).on('value', function (snap) {
                    var tmp = snap.val();
                    $scope.persons = [];
                    for (var key in tmp) {
                        tmp[key].key = key;
                        $scope.persons.push(tmp[key]);
                    }

                    //$scope.$apply();

                });
            }
        } catch (e) {

        }
    }, true);
    //If person/company is selected in list fill $scope
    $scope.selectPerson = function (person) {
        $scope.disqKey = person.key;
        $scope.disqUrl = window.location.href;
        $scope.person = person;
        var ref = new Firebase("https://predictr.firebaseio.com/persAndCompImages/" + person.key);
        var image = new $firebaseObject(ref);
        image.$loaded().then(function () {
            $scope.image = image.image;
        });


    };

    //Rating stuff
    $scope.rate = 7;
    $scope.max = 10;
    $scope.isReadonly = false;

    //Used for star rating
    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };

    $scope.ratingStates = [
        {
            stateOn: 'glyphicon-ok-sign',
            stateOff: 'glyphicon-ok-circle'
        },
        {
            stateOn: 'glyphicon-star',
            stateOff: 'glyphicon-star-empty'
        },
        {
            stateOn: 'glyphicon-heart',
            stateOff: 'glyphicon-ban-circle'
        },
        {
            stateOn: 'glyphicon-heart'
        },
        {
            stateOff: 'glyphicon-off'
        }
  ];

    //Save Prediction
    $scope.submit = function () {
        var predictionObject = {
                prediction: $scope.prediction,
                result: $scope.result,
                hashtags: $scope.hashtags,
                rate: $scope.rate
            }
            //Save Changes in Profile
        var ref = new Firebase("https://predictr.firebaseio.com/users/" + $rootScope.authData.uid + "/changes");
        var refChanges = $firebaseArray(ref);
        var changes = predictionObject;
        changes.person = $scope.person.name;
        refChanges.$add(changes);

        var firebaseUrl = "https://predictr.firebaseio.com/persAndComp/" + $scope.person.key;
        var predictionsFirebaseUrl = firebaseUrl + "/predictions"
        $scope.person.predictions = $firebaseArray(new Firebase(predictionsFirebaseUrl));
        $scope.person.predictions.$add(predictionObject);
        var ref = new Firebase(firebaseUrl);
        ref = ref.child($scope.person.key);
    };

    $scope.editPerson = function (person) {
        $state.go("findPerson.editPerson");
    };

    $scope.report = function () {
        ngDialog.open({
            template: '/dialogs/report.html'
        });
    };
});


app.controller("PersonCtrl", function ($scope, $firebaseArray, $firebaseObject, $firebaseUtils, $rootScope) {
    $scope.addPersOrComp = function () {
        var ref = new Firebase("https://predictr.firebaseio.com/persAndComp/");
        var syncArray = $firebaseArray(ref);
        if ($scope.image === undefined) {
            $scope.image = "http://placehold.it/1920x600";
        }
        var tmpObj = {
            mainCateg: $scope.mainCateg,
            subCateg: $scope.subCateg,
            name: $scope.person.name,
            description: $scope.person.description,
            hashtags: $scope.person.hashtags,
        }

        syncArray.$add(tmpObj).then(function (ref) {
            //save Image in extra Path
            var id = -1;
            console.log("REF_ID", ref.key());
            console.log("REF", ref);
            id = ref.key();
            ref = new Firebase("https://predictr.firebaseio.com/persAndCompImages/" + id);
            var syncObj = $firebaseObject(ref);
            syncObj.image = $scope.image;
            syncObj.$save();
        });


        var ref = new Firebase("https://predictr.firebaseio.com/users/" + $rootScope.authData.uid + "/changes");
        var refChanges = $firebaseArray(ref);
        var changes = tmpObj;
        changes.person = $scope.person.name;
        refChanges.$add(changes);
    };

    $scope.saveChangedPersOrComp = function () {
        var ref = new Firebase("https://predictr.firebaseio.com/persAndComp/");
        ref = ref.child($scope.person.key)
        var obj = $firebaseObject(ref); // an object with data keys
        obj.description = $scope.person.description;
        obj.hashtags = $scope.person.hashtags;
        obj.name = $scope.person.name;
        obj.mainCateg = $scope.person.mainCateg;
        obj.subCateg = $scope.person.subCateg;

        if ($scope.person.predictions !== undefined) {
            obj.predictions = $scope.person.predictions;
        }
        obj.$save();
        //save Image in extra Path
        if ($scope.image !== undefined) {
            ref = new Firebase("https://predictr.firebaseio.com/persAndCompImages/" + obj.$id);
            var syncObj = $firebaseObject(ref);
            syncObj.image = $scope.image;
            syncObj.$save();
        }

        var ref = new Firebase("https://predictr.firebaseio.com/users/" + $rootScope.authData.uid + "/changes");
        var refChanges = $firebaseArray(ref);
        var changes = $scope.person;
        changes.person = $scope.person.name;
        refChanges.$add(changes);

        var ref = new Firebase("https://predictr.firebaseio.com/users/" + $rootScope.authData.uid + "/changes");
        var refChanges = new $firebaseArray(ref);
        var changes = obj;
        changes.person = $scope.person.name;
        refChanges.$add(changes);
    };


    function loadImage(e1) {
        var filename = e1.target.files[0];
        var fr = new FileReader();
        fr.onload = function (res) {
            $scope.image = res.target.result;
            document.getElementById("profileImage").src = res.target.result;
        };
        fr.readAsDataURL(filename);
    }

    document.getElementById("file-upload").addEventListener('change', loadImage, false);



});
app.controller("ratePredictionCtrl", function ($scope) {
    $scope.max = 10;
    $scope.hoveringOver = function (value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
    };
});


app.controller("loginCtrl", function ($scope, $rootScope) {

    function authHandler(error, authData) {
        if (error) {
            $rootScope.$broadcast("loggedIn", false);
            console.log("Login Failed!", error);
        } else {
            $rootScope.$broadcast("loggedIn", true);
            $rootScope.$broadcast("setAuthData", authData);
        }
    };
    var ref = new Firebase("https://predictr.firebaseio.com");
    $scope.authenticate = function (provider) {
        if (provider !== "email") {
            ref.authWithOAuthPopup(provider, authHandler);
        } else {
            ref.authWithPassword({
                email: $scope.email,
                password: $scope.password
            }, authHandler);
        }
    };
    $scope.registration = function () {
        ref.createUser({
            email: $scope.email,
            password: $scope.password
        }, function (error, userData) {
            if (error) {
                console.log("Error creating user:", error);
            } else {
                console.log("Successfully created user account with uid:", userData.uid);
            }
        })
    };
});

app.controller("lookProfileCtrl", function ($scope, $firebaseArray, $firebaseObject, $firebaseUtils, $rootScope) {
    var ref = new Firebase("https://predictr.firebaseio.com/users/");
    $scope.profiles = [];
    ref.on("value", function (snapshot) {
        for (var i in snapshot.val()) {
            var tmp = snapshot.val()[i];
            tmp.id = i;
            $scope.profiles.push(tmp);
        }
    });

    $scope.setMainProfile = function (profile) {
        $scope.mainProfile = profile;
        if ($scope.mainProfile.score === undefined) {
            $scope.mainProfile.score = 0;
        }
        $scope.persons = [];
        for (var change in profile.changes) {
            $scope.persons.push({
                name: profile.changes[change].person,
                changes: JSON.stringify(profile.changes[change])
            });
        }
        ref = new Firebase("https://predictr.firebaseio.com/profileImages/" + profile.id);
        ref = new $firebaseObject(ref);
        ref.$loaded().then(function () {
            $scope.image = ref.image;
        })
    };

    $scope.voteUp = function () {
        ref = new Firebase("https://predictr.firebaseio.com/users/" + $scope.mainProfile.id);
        var obj = new $firebaseObject(ref);
        obj.$loaded().then(function () {
            obj.score = $scope.mainProfile.score + 1;
            obj.$save();
        });
    };
    $scope.voteDown = function () {
        ref = new Firebase("https://predictr.firebaseio.com/users/" + $scope.mainProfile.id);
        var obj = new $firebaseObject(ref);
        obj.$loaded().then(function () {
            obj.score = $scope.mainProfile.score - 1;
            obj.$save();
        });
    };


});
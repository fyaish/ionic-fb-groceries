// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'googlechart'])

.factory('Items', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://amber-torch-2469.firebaseio.com/LessonPath3/Users/u1');
  return $firebaseArray(itemsRef);
}])

.factory("ListWithTotal", ["$firebaseArray",
  function($firebaseArray) {
      // create a new service based on $firebaseArray
      var ListWithTotal = $firebaseArray.$extend({
          getTotal: function() {
              var total = 0;
              // the array data is located in this.$list
              angular.forEach(this.$list, function(rec) {
                  if (!isNaN(rec.rating)) total += rec.rating;
              });
              return total;
          },
          getTotal2: function () {
              var total = 0;
              // the array data is located in this.$list
              angular.forEach(this.$list, function (rec) {
                  if (!isNaN(rec.rating)) total += rec.rating;
              });
              return total;
          }


      });

      return function(listRef) {
          // create an instance of ListWithTotal (the new operator is required)
          return new ListWithTotal(listRef);
      }
  }
])
.controller('ListCtrl', function ($scope, $firebaseArray, $firebaseAuth, $ionicListDelegate, Items, ListWithTotal) {

	$scope.items = Items;
	$scope.myRating = {
		'uid': 'u1',
		'rating': 1,
		'last': 1,
		'dt': Firebase.ServerValue.TIMESTAMP
	}
	$scope.uid = "u1";

	//////////////////////////////////////////////
	///// client authentication state /////////
	////////////////////////////////////////////
	
	var authRef = new Firebase("https://amber-torch-2469.firebaseio.com");
	// create an instance of the authentication service
	var auth = $firebaseAuth(authRef);

    //$scope.login = function() {
      $scope.authData = null;
      $scope.error = null;

	  $scope.authData  = auth.$getAuth(); 
	  if ($scope.authData) {
		console.log('Authenticated user with uid:', $scope.authData.uid); 
	  } else {
		  auth.$authAnonymously().then(function(authData) {
			$scope.authData = authData;
			console.log("Authenticated successfully with payload:", authData);
			console.log("Authenticated with uid:", authData.uid);
		  }).catch(function(error) {
			console.log("Login Failed!", error);
			$scope.error = error;
		  });
		}
	//};
	
	
	/*
	$scope.authData = authRef.getAuth();
	if(!$scope.authData){
		authRef.authAnonymously(function(error, authData) {
		  if (error) {
			console.log("Login Failed!", error);
		  } else {
			console.log("Authenticated successfully with payload:", authData);
			$scope.authData = authData;
		  }
		});	
	}

	authRef.onAuth(function(authData) {
	  if (authData) {
		console.log("Authenticated with uid:", authData.uid);
		$scope.uid = authData.uid;
		$scope.authData = authData;
	  } else {
		console.log("Client unauthenticated.")
	  }
	});
	*/
	/////////////////////////////////////////////////////
	


    //chart
	  $scope.chartObject = {};
	  $scope.chartObject.type = "Gauge";

	  $scope.chartObject.options = {
	      width: 400,
	      height: 120,
	      redFrom: 90,
	      redTo: 100,
	      yellowFrom: 75,
	      yellowTo: 90,
	      minorTicks: 5
	  };

    /*
	  $scope.chartObject.data = [
          ['Label', 'Value'],
          ['Memory', 80],
          ['CPU', 55],
          ['Network', 68]
	  ];
      */

	 var chartDataRef = new Firebase('https://amber-torch-2469.firebaseio.com/TestArr');
    //$scope.chartObject.data = new google.visualization.DataTable( $firebaseArray(chartDataRef));
    //$scope.chartObject.data = $firebaseArray(chartDataRef);
	 $scope.chartObject.data = ListWithTotal(chartDataRef);

	 // var chartDataRef = new Firebase('https://amber-torch-2469.firebaseio.com/presence/User1');
      //$scope.chartObject.data = Firebase.getAsArray(chartDataRef);
	  
	  
      



	$scope.addItem = function() {
		var name = prompt('What do you need to buy?');
		if (name) {
		  $scope.items.$add({
			'name': name
		  });
		}
	};
	var fbLog = function(error, committed, snapshot) {
	  if (error) {
		console.log('Transaction failed abnormally!', error);
	  } else if (!committed) {
		console.log('We aborted the transaction (because wilma already exists).');
	  } else {
		console.log('User wilma added!');
	  }
	  console.log("Wilma's data: ", snapshot.val());
	};
  
 $scope.like = function(rating) {
	var rootRef = new Firebase('https://amber-torch-2469.firebaseio.com/LessonPath3');
	var uid = "u1";		
	var last = $scope.myRating.last;
	$scope.myRating.last = $scope.myRating.rating;
	$scope.myRating.rating = rating; 

	// Users/u1
	var userRef = rootRef.child("Users").child(uid);
	userRef.push($scope.myRating);

	// Current/u1
	var userRef = rootRef.child("Current").child(uid);
	userRef.set($scope.myRating);
	
	// SubTotal
	var subtotalRef = rootRef.child("Subtotal");
	subtotalRef.transaction(function(currentData) {
	  if (currentData === null) {
		return { 'rating': 1, 'total':1, 'count': 1, 'dt': Firebase.ServerValue.TIMESTAMP};
	  } else {
		currentData.total = currentData.total + rating - last;
		currentData.rating = currentData.total / currentData.count;
		currentData.dt = Firebase.ServerValue.TIMESTAMP;
		
		console.log('Subtotal transaction in progress on server.');
		return currentData; 
	  }
	}, fbLog);
			
	
	// Total
	var totalRef = rootRef.child("Total");
	totalRef.transaction(function(currentData) {
	  if (currentData === null) {
		return { 'rating': 1, 'total':1, 'count': 1, 'dt': Firebase.ServerValue.TIMESTAMP};
	  } else {
		currentData.total = currentData.total + rating;
		currentData.count = currentData.count + 1;
		currentData.rating = currentData.total / currentData.count;
		currentData.dt = Firebase.ServerValue.TIMESTAMP;
		
		console.log('Total transaction in progress on server.');
		return currentData; 
	  }
	}, fbLog);
		
		
	};
  
  
  $scope.like22 = function(rating) {
	var last = $scope.myRating.rating;
	var uid = "u1";
	
	$scope.myRating.rating = rating;
	$scope.items.$add($scope.myRating);
	

	//var wilmaRef = new Firebase('https://ionic-fb-demo.firebaseio.com/Last123');
	var wilmaRef = $scope.items.$ref().parent().parent().child("Total");
	wilmaRef.transaction(function(currentData) {
	  if (currentData === null) {
		return { 'rating': 1, 'total':1, 'count': 1, 'dt': Firebase.ServerValue.TIMESTAMP};
	  } else {
		currentData.total = currentData.total + rating;
		currentData.count = currentData.count + 1;
		currentData.rating = currentData.total / currentData.count;
		currentData.dt = Firebase.ServerValue.TIMESTAMP;
		
		console.log('increment rating in progress on server.');
		return currentData; 
	  }
	}, function(error, committed, snapshot) {
	  if (error) {
		console.log('Transaction failed abnormally!', error);
	  } else if (!committed) {
		console.log('We aborted the transaction (because wilma already exists).');
	  } else {
		console.log('User wilma added!');
	  }
	  console.log("Wilma's data: ", snapshot.val());
	});
	
	/////
	var currentRef = $scope.items.$ref().parent().child("Current");
	currentRef.transaction(function(currentData) {
	  if (currentData === null) {
		return { 'rating': 1, 'total':1, 'count': 1, 'dt': Firebase.ServerValue.TIMESTAMP};
	  } else {
		currentData.total = currentData.total + rating -last;
		currentData.rating = currentData.total / currentData.count;
		currentData.dt = Firebase.ServerValue.TIMESTAMP;
		
		console.log('Current increment rating in progress on server.');
		return currentData; 
	  }
	}, function(error, committed, snapshot) {
	  if (error) {
		console.log('Current Transaction failed abnormally!', error);
	  } else if (!committed) {
		console.log('Current aborted the transaction.');
	  } else {
		console.log('Current added!');
	  }
	  console.log("Current data: ", snapshot.val());
	});
  };

   $scope.likeAgain = function() {
		$scope.items.$add($scope.myRating);
  };
  
  $scope.purchaseItem = function(item) {
    var itemRef = new Firebase('https://ionic-fb-demo.firebaseio.com/items/' + item.$id);
    itemRef.child('status').set('purchased');
    $ionicListDelegate.closeOptionButtons();
  };
});

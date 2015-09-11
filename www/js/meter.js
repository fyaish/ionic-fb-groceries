// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

.factory('Items', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://ionic-fb-demo.firebaseio.com/items1');
  return $firebaseArray(itemsRef);
}])

.controller('ListCtrl', function($scope, $ionicListDelegate, Items) {

  $scope.items = Items;
	$scope.myRating = {
		'uid': 'u1',
		'rating': 0,
		'dt': Firebase.ServerValue.TIMESTAMP
	}
  $scope.addItem = function() {
    var name = prompt('What do you need to buy?');
    if (name) {
      $scope.items.$add({
        'name': name
      });
    }
  };
  
  
  $scope.like = function(rating) {
	$scope.myRating.rating = rating;
	$scope.items.$add($scope.myRating);
	

	//var wilmaRef = new Firebase('https://ionic-fb-demo.firebaseio.com/Last123');
	var wilmaRef = $scope.items.$ref().parent().child("Last123");
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

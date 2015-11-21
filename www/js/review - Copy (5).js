// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'googlechart'])

.factory('Items', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://amber-torch-2469.firebaseio.com/LessonPath4/Users/u1');
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

          getTableArray: function () {
              var tbl = new Array();
              // the array data is located in this.$list
              console.log("getTableArray list", this.$list);
              angular.forEach(this.$list, function (rec) {
                  console.log("forEach getTableArray", rec);
                  var arr = new Array(2);
                  arr[0] = rec.Topping;
                  arr[1] = parseInt(rec.Slices);
                  tbl.push(arr);
              });
              console.log("getTableArray", tbl);
              return tbl;
          }


      });

      return function(listRef) {
          // create an instance of ListWithTotal (the new operator is required)
          return new ListWithTotal(listRef);
      }
  }
])
.controller('ListCtrl', function ($scope, $firebaseObject, $firebaseArray, $firebaseAuth, $ionicListDelegate, Items, ListWithTotal) {

	$scope.items = Items;
	$scope.myRating = {
		'uid': 'u1',
		'rating': 1,
		'last': 0,
		'dt': Firebase.ServerValue.TIMESTAMP
	}
	$scope.uid = "u1";

	$scope.getURLParameter = function (name) {
	    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
	};

	console.log("getURLParameter(cid) : ", $scope.getURLParameter("cid"));


	$scope.cid = $scope.getURLParameter("cid");
	if ($scope.cid == null) $scope.cid = "LessonPath11";

	var rootRef = new Firebase("https://amber-torch-2469.firebaseio.com");
	rootRef = rootRef.child($scope.cid);
	$scope.rootRef = rootRef;



    //////////////////////////////////////////////
    ///// client authentication state /////////
    ////////////////////////////////////////////

    // create an instance of the authentication service
    var authRef = rootRef.root(); 
    var auth = $firebaseAuth(authRef);

    var presenceRef = authRef.child(".info/connected");
    var listRef = rootRef.child("presence");
    var userRef = rootRef.child("presence/default"); 
	  
    // any time auth status updates, add the user data to scope
	  auth.$onAuth(function (authData) {
	      if (authData) {
	          console.log("onAuth - Authenticated with uid:", authData.uid);
	          $scope.uid = authData.uid;
	          $scope.authData = authData;
	          
	          userRef = rootRef.child("presence").child(authData.uid);
	          presenceRef.on("value", function (snap) {
	              if (snap.val()) {
	                  userRef.child("auth").set(authData.auth);	                 
	                  userRef.onDisconnect().remove();  // Remove ourselves when we disconnect.
	                  rootRef.child("Users").child(authData.uid).child("auth").set(authData.auth);

	              }
	          });

	      } else {
	          $scope.uid = null;
	          $scope.authData = null;
	          console.log("onAuth - Client unauthenticated.");

	          auth.$authAnonymously().then(function (authData) {
	              $scope.authData = authData;
	              $scope.uid = authData.uid;
	              console.log("Authenticated Anonymously with uid:", authData.uid);
	          }).catch(function (error) {
	              console.log("Authenticated Anonymously Failed!", error);
	              $scope.error = error;
	          });
	      }
	  });

    ///////////////////////////////////////
    ///////
    /////////////////////////////////////////

	  $("#divRateIt").bind('rated',
          function (event, value) {
              //$('#value5').text('You\'ve rated it: ' + value);
              $scope.like(value);
          });

	  //$("#divRateIt").bind('reset', function () { $('#value5').text('Rating reset'); });
	  //$("#divRateIt").bind('over', function (event, value) { $('#hover5').text('Hovering over: ' + value); });

	  rootRef.child("Total").on("value", function (snap) {
	      var data = snap.val();
	      console.log("on Total ", data);
	      $('#divTotalRating').rateit('value', data.rating);
	  });

    // Number of online users is the number of objects in the presence list.
	  listRef.on("value", function (snap) {
	      console.log("# of online users = " + snap.numChildren());
	  });

	  var subtotalObj = $firebaseObject(rootRef.child("Total"));
	  subtotalObj.$bindTo($scope, "SubtotalRating");

    //Done working chart
    /////////////////////////////////////
    ///////////////////////////////////////

    //chart
	  $scope.chartObject = {};
	  $scope.chartObject.type = "BarChart";

	  $scope.chartObject.options = {
	      legend: 'none'
	  };

    	  
	  var chartArrayRef = rootRef.child("Total"); 
	  var chartArrayObj = $firebaseObject(chartArrayRef);
	      chartArrayObj.$watch(function () {
	          var chartData = new google.visualization.DataTable();
	          chartData.addColumn('string', 'Stars');
	          chartData.addColumn('number', 'rating');
	          chartData.addColumn({ type: 'string', role: 'style' });
	          console.log("data changed!", chartArrayObj);

	          for (var i = 5; i>0; i--) {
	              var arr = new Array(3);
	              arr[0] = i + " \u2605 ";
	              arr[1] = 0;
	              if (chartArrayObj.data)
	                  if (chartArrayObj.data.length >= i)
	                        arr[1] = chartArrayObj.data[i];
	              arr[2] = "color:orange; opacity: 0.6";
	              chartData.addRow(arr);
	          }
	          var view = new google.visualization.DataView(chartData);
	          view.setColumns([0, 1,
                               {
                                   calc: "stringify",
                                   sourceColumn: 1,
                                   type: "string",
                                   role: "annotation"
                               },
                               2]);

	          $scope.chartObject.data = view; //chartData;
	      });

    //Done working chart
    ////////////////////////
    /*
      var chartDataRef = new Firebase('https://amber-torch-2469.firebaseio.com/LessonPath1/Users/u1');	 
	  var chartDataQuery = chartDataRef.orderByChild("timestamp").limitToLast(6);
	  $scope.chartDataFba = $firebaseArray(chartDataQuery);


	  $scope.chartDataFba.$watch(function () {
	      var col = ['Topping', 'Slices'];
	      var typ = ['string',  'number'];
	      var chartData = new google.visualization.DataTable();
	      chartData.addColumn(typ[0], col[0]);
	      chartData.addColumn(typ[1], col[1]);
	      //chartData.addColumn('string', 'key');

	      for (var i = 0; i < $scope.chartDataFba.length; i++) {
	          var obj = $scope.chartDataFba[i];
	          var arr = new Array(2);
	          arr[0] = obj[col[0]];
	          arr[1] = obj[col[1]];
	          chartData.addRow(arr);
	      }
	      console.log("chartDataFba.watch", chartData);
	      $scope.chartObject.data = chartData;
	  });
      */
  ///////////////////////////////////////////////////



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
    var rootRef = $scope.rootRef; 
    var uid =  $scope.uid;		
	var last = $scope.myRating.rating;
	if (isNaN(last)) last = 0;
	$scope.myRating.last = last; 
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
	      return { 'rating': 1, 'total':1, 'count': 1, 'dt': Firebase.ServerValue.TIMESTAMP, 'data': [0,1,0,0,0,0]};
	  } else {
		currentData.total = currentData.total + rating - last;
		currentData.rating = currentData.total / currentData.count;
		currentData.data[rating]++;
		if (currentData.data[last]>0) currentData.data[last]--;
		currentData.dt = Firebase.ServerValue.TIMESTAMP;
		
		console.log('Subtotal transaction in progress on server.');
		return currentData; 
	  }
	}, fbLog);
			
	
	// Total
	var totalRef = rootRef.child("Total");
	totalRef.transaction(function(currentData) {
	  if (currentData === null) {
	      return { 'rating': 1, 'total': 1, 'count': 1, 'dt': Firebase.ServerValue.TIMESTAMP, 'data': [0, 1, 0, 0, 0, 0] };
	  } else {
		currentData.total = currentData.total + rating;
		currentData.count = currentData.count + 1;
		currentData.rating = currentData.total / currentData.count;
		currentData.data[rating]++;
		currentData.dt = Firebase.ServerValue.TIMESTAMP;
		
		console.log('Total transaction in progress on server.');
		return currentData; 
	  }
	}, fbLog);
		
		
	};
  

  
  $scope.purchaseItem = function(item) {
    var itemRef = new Firebase('https://ionic-fb-demo.firebaseio.com/items/' + item.$id);
    itemRef.child('status').set('purchased');
    $ionicListDelegate.closeOptionButtons();
  };
});

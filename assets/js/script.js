var map;
var marker;
var directionsDisplay;
var currentLocation;
var destination;
var routeMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 54.5970, lng: -5.9301 }, // Default center (United Kingdom)
        zoom: 6
    });

    // Initialize marker
    marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP
    });

    // Initialize Directions service
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

    // Add event listener for search button
    document.getElementById('search-button').addEventListener('click', function() {
        destination = document.getElementById('destination-input').value;
        if (destination) {
            fetchCurrentLocationAndCalculateRoute();
        } else {
            alert('Please enter the destination.');
        }
    });

    // Add event listener for direction button
    document.getElementById('direction-button').addEventListener('click', function() {
        if (currentLocation) {
            map.setCenter(currentLocation);
            map.setZoom(15);
            startTracking();
        } else {
            alert('Current location not available.');
        }
    });

    // Add event listener for driving distance button
    document.getElementById('driving-distance-button').addEventListener('click', function() {
        if (currentLocation && destination) {
            var directionsService = new google.maps.DirectionsService();

            var request = {
                origin: currentLocation,
                destination: destination,
                travelMode: 'DRIVING'
            };

            directionsService.route(request, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                    clearRouteMarkers();
                } else {
                    alert('Error fetching directions: ' + status);
                }
            });
        } else {
            alert('Current location or destination not available.');
        }
    });
}

function updateMarker(location) {
    marker.setPosition(location);
}

function fetchCurrentLocationAndCalculateRoute() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            updateMarker(currentLocation);
            calculateAndDisplayRoute();
        }, function(error) {
            alert('Error getting current location: ' + error.message);
        }, { enableHighAccuracy: true });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function startTracking() {
    navigator.geolocation.watchPosition(function(position) {
        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        updateMarker(currentLocation);
        map.setCenter(currentLocation); // Update map center
    }, function(error) {
        alert('Error tracking location: ' + error.message);
    }, { enableHighAccuracy: true });
}

function calculateAndDisplayRoute() {
    if (currentLocation && destination) {
        var directionsService = new google.maps.DirectionsService();

        var request = {
            origin: currentLocation,
            destination: destination,
            travelMode: 'WALKING'
        };

        directionsService.route(request, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
                var route = response.routes[0];
                if (routeMarkers.length > 0) {
                    for (var i = 0; i < routeMarkers.length; i++) {
                        routeMarkers[i].setMap(null);
                    }
                    routeMarkers = [];
                }
                for (var i = 0; i < route.legs.length; i++) {
                    var steps = route.legs[i].steps;
                    for (var j = 0; j < steps.length; j++) {
                        var path = steps[j].path;
                        for (var k = 0; k < path.length; k += 10) { // Adjust interval as needed
                            var marker = new google.maps.Marker({
                                position: path[k],
                                map: map,
                                icon: {
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: 4,
                                    fillOpacity: 1,
                                    fillColor: 'blue',
                                    strokeOpacity: 1,
                                    strokeColor: 'white',
                                    strokeWeight: 2
                                }
                            });
                            routeMarkers.push(marker);
                        }
                    }
                }
                // Display step-by-step instructions
                displayRouteInstructions(response.routes[0].legs[0].steps);
            } else {
                alert('Error fetching directions: ' + status);
            }
        });
    }
}

function displayRouteInstructions(steps) {
    var instructions = document.getElementById('instructions');
    instructions.innerHTML = ''; // Clear previous instructions

    for (var i = 0; i < steps.length; i++) {
        var instruction = document.createElement('div');
        instruction.textContent = steps[i].instructions;
        instructions.appendChild(instruction);
    }
}

function clearRouteMarkers() {
    for (var i = 0; i < routeMarkers.length; i++) {
        routeMarkers[i].setMap(null);
    }
    routeMarkers = [];
}

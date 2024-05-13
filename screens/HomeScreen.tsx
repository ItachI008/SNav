import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../API/gmapApi';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INCIDENT_RADIUS = 1000;

const HomeScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directions, setDirections] = useState(null);
  const [incidentDetected, setIncidentDetected] = useState(false);
  const [userEmergencyContacts, setUserEmergencyContacts] = useState([]);
  const mapViewRef = useRef(null);
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    requestLocationPermission();
    Location.watchPositionAsync({ distanceInterval: 10 }, handleLocationUpdate);
    fetchUserEmergencyContacts();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location.coords);
    checkForIncidents(location.coords);
  };

  const fetchUserEmergencyContacts = async () => {
    try {
      if (currentUser) {
        const userContactsQuery = query(collection(FIRESTORE_DB, "emergencyContacts"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(userContactsQuery);
        const contacts = querySnapshot.docs.map((doc) => doc.data());
        setUserEmergencyContacts(contacts);
      }
    } catch (error) {
      console.error("Error fetching user's emergency contacts:", error);
    }
  };

  const checkForIncidents = (coords) => {
    if (destinationCoords) {
      const distance = calculateDistance(destinationCoords.latitude, destinationCoords.longitude, coords.latitude, coords.longitude);
      if (distance <= INCIDENT_RADIUS) {
        setIncidentDetected(true);
      } else {
        setIncidentDetected(false);
      }
    } else {
      setIncidentDetected(false);
    }
  };


  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance; // Distance in meters
  };

  // Search for a destination
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}&traffic_model=pessimistic`
      );
      const data = await response.json();
      const { lat, lng } = data.results[0].geometry.location;
      setDestinationCoords({ latitude: lat, longitude: lng });
    } catch (error) {
      console.log(error);
    }
  };

  // Navigate to the destination
  const handleNavigation = async () => {
    try {
      if (currentLocation && destinationCoords) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const { routes } = data;
        if (routes.length > 0) {
          const route = routes[0];
          setDirections(route.overview_polyline.points);

          const northeastLat = Math.max(currentLocation.latitude, destinationCoords.latitude);
          const southwestLat = Math.min(currentLocation.latitude, destinationCoords.latitude);
          const northeastLng = Math.max(currentLocation.longitude, destinationCoords.longitude);
          const southwestLng = Math.min(currentLocation.longitude, destinationCoords.longitude);

          const newRegion = {
            latitude: (northeastLat + southwestLat) / 2,
            longitude: (northeastLng + southwestLng) / 2,
            latitudeDelta: Math.abs(northeastLat - southwestLat) + 0.01,
            longitudeDelta: Math.abs(northeastLng - southwestLng) + 0.01,
          };

          mapViewRef.current.animateToRegion(newRegion, 1000);

          checkForIncidents(currentLocation);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  const sendSMS = async (to, body) => {
    try {
      const response = await fetch('http://ip-address-or-server-address/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, body }),
      });
      const data = await response.json();
      console.log(data); // Response from the server
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };
  

  // Send SOS message
  const handleSOS = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const locationUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`;
        userEmergencyContacts.forEach(async (contact) => {
          await sendSMS(contact.contactNumber, `SOS! I need help! My current location: ${locationUrl}`);
          console.log(`SOS message sent to ${contact.name}`);
        });
        Alert.alert('SOS Sent', 'Emergency message has been sent to your contacts.');
      } else {
        Alert.alert('Authentication Error', 'User authentication failed. Please log in again.');
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS message. Please try again later.');
    }
  };


  

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 0,
          longitude: currentLocation ? currentLocation.longitude : 0,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
          />
        )}
        {directions && (
          <Polyline
            coordinates={decodePolyline(directions)}
            strokeWidth={4}
            strokeColor="green"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={{
              latitude: destinationCoords.latitude,
              longitude: destinationCoords.longitude,
            }}
            title="Destination"
          />
        )}
      </MapView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>SEARCH</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleNavigation} style={styles.navigateButton}>
        <Text style={styles.navigateButtonText}>NAVIGATE</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSOS} style={styles.sosButton}>
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>
      {incidentDetected && (
        <View style={styles.incidentNotification}>
          <Text style={styles.incidentText}>Incident detected nearby!</Text>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1F41BB',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  navigateButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#1F41BB',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sosButton: {
    position: 'absolute',
    bottom: 90,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  incidentNotification: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  incidentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Function to decode polyline points
const decodePolyline = (encoded) => {
  const points = [];
  let index = 0,
    lat = 0,
    lng = 0;
  const len = encoded.length;
  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

export default HomeScreen;





// Import the necessary modules
/*import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../API/gmapApi';
import TwilioSMS from './TwilioSMS'; // Import TwilioSMS component


import { getAuth } from 'firebase/auth'; // Import getAuth function from Firebase auth module

const { width, height } = Dimensions.get('window');

// Constants for map display
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INCIDENT_RADIUS = 1000; // 1 KM in meters

// HomeScreen component
const HomeScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directions, setDirections] = useState(null);
  const [incidentDetected, setIncidentDetected] = useState(false);
  const mapViewRef = useRef(null);
  

  // Fetch current location on component mount
  useEffect(() => {
    requestLocationPermission();
    Location.watchPositionAsync({ distanceInterval: 10 }, handleLocationUpdate);
  }, []);


  
  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle location updates
  const handleLocationUpdate = (location) => {
    setCurrentLocation(location.coords);
    checkForIncidents(location.coords);
  };

  // Check for incidents near the current location
  const checkForIncidents = (coords) => {
    if (destinationCoords) {
      const distance = calculateDistance(destinationCoords.latitude, destinationCoords.longitude, coords.latitude, coords.longitude);
      if (distance <= INCIDENT_RADIUS) {
        setIncidentDetected(true);
      } else {
        setIncidentDetected(false);
      }
    } else {
      setIncidentDetected(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance; // Distance in meters
  };

  // Search for a destination
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}&traffic_model=pessimistic`
      );
      const data = await response.json();
      const { lat, lng } = data.results[0].geometry.location;
      setDestinationCoords({ latitude: lat, longitude: lng });
    } catch (error) {
      console.log(error);
    }
  };

  // Navigate to the destination
  const handleNavigation = async () => {
    try {
      if (currentLocation && destinationCoords) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        const { routes } = data;
        if (routes.length > 0) {
          const route = routes[0];
          setDirections(route.overview_polyline.points);

          const northeastLat = Math.max(currentLocation.latitude, destinationCoords.latitude);
          const southwestLat = Math.min(currentLocation.latitude, destinationCoords.latitude);
          const northeastLng = Math.max(currentLocation.longitude, destinationCoords.longitude);
          const southwestLng = Math.min(currentLocation.longitude, destinationCoords.longitude);

          const newRegion = {
            latitude: (northeastLat + southwestLat) / 2,
            longitude: (northeastLng + southwestLng) / 2,
            latitudeDelta: Math.abs(northeastLat - southwestLat) + 0.01,
            longitudeDelta: Math.abs(northeastLng - southwestLng) + 0.01,
          };

          mapViewRef.current.animateToRegion(newRegion, 1000);

          checkForIncidents(currentLocation);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Send SOS message
  const handleSOS = async () => {
    try {
      const auth = getAuth(); // Get authentication instance
      const user = auth.currentUser; // Retrieve current user
      if (user) {
        // Retrieve user's emergency contacts and send SOS message
        // Replace this with your SMS sending logic
        const emergencyContacts = []; // Get emergency contacts
        emergencyContacts.forEach(async (contact) => {
          // Send SOS message to each contact
          // For example:
          // await sendSOSMessage(contact.phoneNumber, currentLocation);
          console.log(`SOS message sent to ${contact.name}`);
        });
        Alert.alert('SOS Sent', 'Emergency message has been sent to your contacts.');
      } else {
        Alert.alert('Authentication Error', 'User authentication failed. Please log in again.');
      }
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS message. Please try again later.');
    }
  };

  // Render UI
  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 0,
          longitude: currentLocation ? currentLocation.longitude : 0,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
          />
        )}
        {directions && (
          <Polyline
            coordinates={decodePolyline(directions)}
            strokeWidth={4}
            strokeColor="green"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={{
              latitude: destinationCoords.latitude,
              longitude: destinationCoords.longitude,
            }}
            title="Destination"
          />
        )}
      </MapView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter destination"
          value={destination}
          onChangeText={setDestination}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>SEARCH</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleNavigation} style={styles.navigateButton}>
        <Text style={styles.navigateButtonText}>NAVIGATE</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSOS} style={styles.sosButton}>
        <Text style={styles.sosButtonText}>SOS</Text>
      </TouchableOpacity>
      {incidentDetected && (
        <View style={styles.incidentNotification}>
          <Text style={styles.incidentText}>Incident detected nearby!</Text>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1F41BB',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  navigateButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#1F41BB',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sosButton: {
    position: 'absolute',
    bottom: 90,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  incidentNotification: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  incidentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Function to decode polyline points
const decodePolyline = (encoded) => {
  const points = [];
  let index = 0,
    lat = 0,
    lng = 0;
  const len = encoded.length;
  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

// Export the component as default
export default HomeScreen; */

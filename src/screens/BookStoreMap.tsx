import { StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

// Replace with your actual Google Places API Key
const GOOGLE_PLACES_API_KEY = 'AIzaSyA3FzKFHiA7bUcmOaubinG6wqCZt8Dw7Yk';

export default function BookStoreMap() {
    const [userLocation, setUserLocation] = useState<{
        latitude: number, 
        longitude: number
    }>({
        latitude: 24.9191084,
        longitude: 67.1183683
    });
    const [bookstores, setBookstores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS doesn't need explicit permission
    };

    const fetchNearbyBookstores = async (latitude: number, longitude: number) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
                `location=${latitude},${longitude}` +
                `&radius=5000` +
                `&type=book_store` +
                `&key=${GOOGLE_PLACES_API_KEY}`
            );
            console.log(response);
            if (response.data.results) {
                setBookstores(response.data.results);
                
            }
        } catch (error) {
            console.error('Error fetching bookstores:', error);
        }
    };

    useEffect(() => {
        const getLocation = async () => {
            const hasPermission = await requestLocationPermission();
            
            if (hasPermission) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ latitude, longitude });
                        fetchNearbyBookstores(latitude, longitude);
                        setIsLoading(false);
                    },
                    (error) => {
                        console.log('GetCurrentPosition Error', error);
                        setIsLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            } else {
                setIsLoading(false);
            }
        };

        getLocation();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading location...</Text>
            </View>
        );
    }

    return (
        <MapView 
            style={{width:'100%', height:'100%'}}
            initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            }}
        >
            {/* User Location Marker */}
            <Marker
                coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                }}
                title="Your Location"
                pinColor="blue"
            />

            {/* Bookstore Markers */}
            {}
            {
            bookstores.map((store, index) => (
                <Marker
                    key={index}
                    coordinate={{
                        latitude: store.geometry.location.lat,
                        longitude: store.geometry.location.lng
                    }}
                    title={store.name}
                    description={store.vicinity}
                />
            ))}
        </MapView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
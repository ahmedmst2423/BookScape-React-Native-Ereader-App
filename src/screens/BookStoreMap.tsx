import { StyleSheet, Text, View, PermissionsAndroid, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker,PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

// Replace with your actual Google Places API Key
const GOOGLE_PLACES_API_KEY = process.env.PLACES_API_KEY;

export default function BookStoreMap() {
    const [userLocation, setUserLocation] = useState<{
        latitude: number, 
        longitude: number
    }>({
        latitude: 10.00,
        longitude: 20.00
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
            console.log("Permission Granted!!!!!")
            
            if (hasPermission) {
                Geolocation.getCurrentPosition(
                    (position) => {
                        console.log('Position:', position);
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ latitude, longitude });
                       
                        setIsLoading(false);
                    },
                    (error) => {
                        console.log('GetCurrentPosition Error', error);
                        setIsLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
                );
                fetchNearbyBookstores(userLocation.latitude, userLocation.longitude);

            } else {
                setIsLoading(false);
            }
        };

        getLocation();
    },[]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading location...</Text>
            </View>
        );
    }

    return (
        <MapView 
            provider={PROVIDER_GOOGLE}
            style={{width:'100%', height:'100%'}}
            showsUserLocation={true}
            showsCompass={true}
            showsIndoors={true}
            showsMyLocationButton={true}
            
            initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0005,
                longitudeDelta: 0.0005,
            }}
            
        >
           

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
                    pinColor='red'
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
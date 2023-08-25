import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, RefreshControl, TouchableOpacity, FlatList, Vibration, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeBaseProvider, Image, Button, ScrollView } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function VerMasTarde() {
    const navigation = useNavigation();
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLongPress, setIsLongPress] = useState(false);

    const fetchFavoriteMovies = async () => {
        try {
            const favorites = await AsyncStorage.getItem('favoriteMovies');
            console.log('favorites', favorites);
            const favoritesArray = favorites ? JSON.parse(favorites) : [];
            setFavoriteMovies(favoritesArray);
        } catch (error) {
            console.error('Error al obtener las películas favoritas:', error);
        }
    };

    useEffect(() => {
        const navigationOptions = {
            title: '',
        };
        navigationOptions.headerTransparent = true;
        navigationOptions.headerTitle = null;
        navigationOptions.headerLeft = null;
        navigationOptions.headerRight = null;
        navigation.setOptions(navigationOptions);

        fetchFavoriteMovies();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFavoriteMovies();
        setRefreshing(false);
    };

    const deleteFavoriteMovieByTitle = async (title) => {
        try {
            const favorites = await AsyncStorage.getItem('favoriteMovies');
            const favoritesArray = favorites ? JSON.parse(favorites) : [];
            const newFavoritesArray = favoritesArray.filter(
                (favorite) => favorite.title !== title
            );
            await AsyncStorage.setItem(
                'favoriteMovies',
                JSON.stringify(newFavoritesArray)
            );
            setFavoriteMovies(newFavoritesArray);
        } catch (error) {
            console.error('Error al eliminar la película favorita:', error);
        }
    };

    const onLongPress = () => {
        setIsLongPress((prev) => !prev);
        Vibration.vibrate(50);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.movieItem}
            onLongPress={onLongPress}
        >
            <Image
                source={{ uri: item.poster }}
                style={{ width: 150, height: 200, borderRadius: 10 }}
                alt='Poster'
            />
            <Text style={{ color: 'white', marginTop: 5 }}>{item.title}</Text>
            {isLongPress && (
                <Button
                    size="xs"
                    onPress={() => deleteFavoriteMovieByTitle(item.title)}
                    colorScheme="error"
                >
                    Eliminar
                </Button>
            )}
        </TouchableOpacity>
    );

    return (
        <NativeBaseProvider>
            <View style={styles.favoriteContainer}>
                <Text style={styles.title}>Películas guardadas</Text>
                {favoriteMovies.length === 0 ? (
                    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>
                            No hay películas guardadas
                        </Text>
                    </ScrollView>
                ) : (
                    <FlatList
                        data={favoriteMovies}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        numColumns={2}
                        contentContainerStyle={styles.movieList}
                    />
                )}
            </View>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    favoriteContainer: {
        backgroundColor: '#1c1d30',
        height: '100%',
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        marginTop: 60,
        marginBottom: 20,
        color: 'white',
    },
    movieList: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 120,
    },
    movieItem: {
        width: (width - 40) / 2,
        margin: 10,
        alignItems: 'center',
    },
});

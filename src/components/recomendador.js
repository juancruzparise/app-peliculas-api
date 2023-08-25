import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native';
import { NativeBaseProvider, Center, VStack, Skeleton, useToast, Button } from 'native-base';
import axios from 'axios';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import YoutubePlayer from "react-native-youtube-iframe";
import AsyncStorage from '@react-native-async-storage/async-storage';

function CustomBackButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{
                marginTop: 20, marginLeft: 20, width: 45, height: 45,
                backgroundColor: 'rgba(128, 128, 128, 0.8)', padding: 10, borderRadius: 5
            }}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </View>
        </TouchableOpacity>
    );
}

function CustomRefreshButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{
                marginTop: 20, marginRight: 20, width: 45, height: 45,
                backgroundColor: 'rgba(128, 128, 128, 0.8)', padding: 10, borderRadius: 5
            }}>
                <Ionicons name="refresh" size={24} color="black" />
            </View>
        </TouchableOpacity>
    );
}

function CustomFavoriteButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={{
                marginTop: 20, marginRight: 20, width: 45, height: 45,
                backgroundColor: 'rgba(128, 128, 128, 0.8)', padding: 10, borderRadius: 5
            }}>
                <MaterialIcons name="favorite" size={24} color="black" />
            </View>
        </TouchableOpacity>
    );
}

export default function Recomendador() {
    const API_URL = 'https://api.themoviedb.org/3';
    const API_KEY = '872d1bc03a4f0edfefde1bc5ceb19efd';
    const IMAGE_PATH = 'https://image.tmdb.org/t/p/original';
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentMovie, setCurrentMovie] = useState('');
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [showMovie, setShowMovie] = useState(false);

    const handleGoBack = () => {
        if (showMovie) {
            setShowMovie(false);
        } else {
            navigation.dispatch(CommonActions.goBack());
        }
    };

    useEffect(() => {
        const navigationOptions = {
            title: '',
        };

        if (showMovie) {
            navigationOptions.headerLeft = () => <CustomBackButton onPress={handleGoBack} />;
            navigationOptions.headerRight = () => (
                <React.Fragment>
                    <View style={{ flexDirection: 'row' }}>
                        <CustomRefreshButton onPress={handleGetAnotherRecommendation} />
                    </View>
                </React.Fragment>
            );
        }
        else {
            navigationOptions.headerTransparent = true;
            navigationOptions.headerTitle = null;
            navigationOptions.headerLeft = null;
            navigationOptions.headerRight = null;
        }

        navigation.setOptions(navigationOptions);
    }, [showMovie]);

    useEffect(() => {
        axios.get(`${API_URL}/genre/movie/list?api_key=${API_KEY}&language=es`)
            .then(response => {
                setCategories(response.data.genres);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const subscription = navigation.addListener('beforeRemove', (e) => {
                if (showMovie) {
                    setShowMovie(false);
                    setCurrentMovie(null);
                    e.preventDefault();
                }
            });

            return () => {
                subscription();
            };
        }, [showMovie])
    );

    const handleCategorySelect = categoryId => {
        setSelectedCategory(categoryId);
        setShowMovie(true);
        setIsLoading(true);
        fetchRandomRecommendation(categoryId);
    };

    const fetchRandomRecommendation = async (categoryId) => {
        try {
            const response = await axios.get(`${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${categoryId}&language=es`);
            const moviesForCategory = response.data.results;
            
            const randomIndex = Math.floor(Math.random() * moviesForCategory.length);
            const recommendedMovie = moviesForCategory[randomIndex];
            
            const movieResponse = await axios.get(`${API_URL}/movie/${recommendedMovie.id}?api_key=${API_KEY}&append_to_response=genres`);
            recommendedMovie.categories = movieResponse.data.genres;
            
            const castResponse = await axios.get(`${API_URL}/movie/${recommendedMovie.id}/credits?api_key=${API_KEY}`);
            recommendedMovie.cast = castResponse.data.cast;
            
            const videoResponse = await axios.get(`${API_URL}/movie/${recommendedMovie.id}/videos?api_key=${API_KEY}`);
            recommendedMovie.video = videoResponse.data.results[0];
            
            console.log("Current Movie:", recommendedMovie.title);
            setCurrentMovie(recommendedMovie);
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };
    

    const handleGetAnotherRecommendation = () => {
        setIsLoading(true);
        fetchRandomRecommendation(selectedCategory);
    };

    useEffect(() => {
        if (currentMovie) {
            console.log("Current Movie Test:", currentMovie.title);
        }
    }, [currentMovie]);

        
    const handleGetSaveFavoriteAsyncStorage = async () => {
        if (currentMovie) {
            const favoriteMovie = {
                title: currentMovie.title,
                poster: currentMovie.poster_path ? `${IMAGE_PATH}${currentMovie.poster_path}` : null,
            };

            try {
                const favorites = await AsyncStorage.getItem('favoriteMovies');
                const favoritesArray = favorites ? JSON.parse(favorites) : [];

                const isAlreadyFavorite = favoritesArray.some(movie => movie.title === favoriteMovie.title);

                if (isAlreadyFavorite) {
                    alert('Ya existe una película con ese título en tu lista');
                } else {
                    favoritesArray.push(favoriteMovie);

                    await AsyncStorage.setItem('favoriteMovies', JSON.stringify(favoritesArray));
                    alert('Película añadida a tu lista');
                }
            } catch (error) {
                toast.show({
                    title: 'Error',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                console.error('Error al guardar la película como favorita:', error);
            }
        }
        else{
            console.log("No hay pelicula");
        }
    };

    return (
        <NativeBaseProvider>
            <ScrollView>
                {showMovie ? (
                    isLoading ? (
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} height={1250}>
                            <VStack w="100%" space={8} overflow="hidden" rounded="md" marginTop={50}>
                                <Skeleton h={250} borderRadius={10} />
                                <VStack px={4} space={2}>
                                    <Skeleton h={6} />
                                    <Skeleton h={6} />
                                    <Skeleton h={6} />
                                </VStack>
                            </VStack>
                        </View>
                    ) : (
                        <ImageBackground
                            source={{ uri: currentMovie ? `${IMAGE_PATH}${currentMovie.backdrop_path}` : null }}
                            style={{ width: '100%', height: 1250, flex: 1, resizeMode: 'cover' }}
                        >
                            <ScrollView style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                                <Center>
                                    <Image
                                        source={{ uri: currentMovie ? `${IMAGE_PATH}${currentMovie.poster_path}` : null }}
                                        style={{ width: '50%', height: 250, marginTop: 120, borderRadius: 10 }}
                                    />
                                            <TouchableOpacity onPress={handleGetSaveFavoriteAsyncStorage} style={{ marginTop: 20, backgroundColor: '#f42e88', padding: 10, borderRadius: 5 }}>
                                                <Text style={{ color: 'white' }}>
                                                Añadir a tu lista
                                                </Text>
                                            </TouchableOpacity>
                                    <View
                                        style={{
                                            flex: 1,
                                            borderTopLeftRadius: 30,
                                            borderTopRightRadius: 30,
                                            padding: 20,
                                        }}
                                    >
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                                            {currentMovie.title}
                                        </Text>
                                        <Text style={{ fontSize: 14, marginTop: 10, color: 'white' }}>
                                            {currentMovie.overview}
                                        </Text>
                                        <Text style={{ color: 'white', marginTop: 10 }}>Puntaje: {currentMovie.vote_average}</Text>
                                        <Text style={{ color: 'white', marginTop: 10 }}>Popularidad: {currentMovie.popularity}</Text>
                                        <Text style={{ color: 'white', marginTop: 10 }}>Fecha de estreno: {currentMovie.release_date}</Text>
                                        <ScrollView horizontal>
                                            {currentMovie && currentMovie.cast ? (
                                                currentMovie.cast.slice(0, 10).map(actor => (
                                                    <View key={actor.id} style={{ alignItems: 'center', marginRight: 20 }}>
                                                        <Image
                                                            source={{ uri: `${IMAGE_PATH}${actor.profile_path}` }}
                                                            style={{ width: 100, height: 150, borderRadius: 10 }}
                                                        />
                                                        <Text style={{ color: 'white', marginTop: 5 }}>{actor.name}</Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={{ color: 'white' }}>Reparto no disponible</Text>
                                            )}
                                        </ScrollView>
                                        <Text style={{ marginTop: 20, fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Trailer</Text>
                                        {currentMovie.video ? (
                                            <View style={{ marginTop: 20 }}>
                                                <YoutubePlayer
                                                    height={400}
                                                    play={false}
                                                    videoId={currentMovie.video.key}
                                                />
                                            </View>
                                        ) : (
                                            <Text style={{ color: 'white', textAlign: 'center' }}>Video no disponible</Text>
                                        )}
                                    </View>
                                </Center>
                            </ScrollView>
                        </ImageBackground>
                    )
                ) : (
                    <View style={styles.containerCategories}>
                        <Text style={{ marginTop: 60, marginBottom: 30, fontSize: 20, fontWeight: 'bold', color: 'white' }}>Categorias</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((category, index) => (
                                <TouchableOpacity
                                    key={category.id}
                                    onPress={() => handleCategorySelect(category.id)}
                                    style={[
                                        styles.categoryItem,
                                        { backgroundColor: '#2c2c42' },
                                        index % 2 === 0 ? { marginRight: 10 } : { marginLeft: 10 }
                                    ]}
                                >
                                    <Text style={{ color: 'white' }}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    containerCategories: {
        flex: 1,
        backgroundColor: '#1c1d30',
        alignItems: 'center',
        paddingVertical: 20,
        height: 850,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    categoryItem: {
        width: '40%',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

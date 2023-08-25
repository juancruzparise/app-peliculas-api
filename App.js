import * as React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import VerMasTarde from './src/components/VerMasTarde';
import Recomendador from './src/components/recomendador';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'movie';
            } else if (route.name === 'Ver más tarde') {
              iconName = 'favorite';
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarActiveTintColor: '#f52f8a',
          tabBarStyle: styles.tabBarStyle,
        })}
      >
        <Tab.Screen
          name="Home"
          component={Recomendador}
          options={{
            tabBarLabel: 'Recomendador',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="movie" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Ver más tarde"
          component={VerMasTarde}
          options={{
            tabBarLabel: 'Ver más tarde',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="favorite" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  tabBarStyle: {
    backgroundColor: '#242439',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    justifyContent: 'center',
  },
});

export default App;

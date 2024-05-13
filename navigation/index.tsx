import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";
import { Ionicons } from '@expo/vector-icons'; // Importing icons
import Colors from "../constants/Colors";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import Welcome from "../screens/WelcomeScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import ViewContacts from "../screens/ViewContacts";
import ForgotPassword from "../screens/ForgotPassword";
import FeedbackScreen from "../screens/FeedbackScreen";
import { RootStackParamList } from "../types";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeTabNavigator() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: '#1F41BB',
        inactiveTintColor: '#626262',
        labelStyle: {
          fontSize: 16,
        },
        style: {
          backgroundColor: 'white',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'alert-circle' : 'alert-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
  name="Feedback"
  component={FeedbackScreen}
  options={{
    tabBarIcon: ({ focused, color, size }) => (
      <Ionicons size={size} color={color} name={focused ? 'chatbubble' : 'chatbubble-outline'} />
    ),
  }}
/>
           <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Contacts" component={ViewContacts}/>
      <Stack.Screen name="Home" component={HomeTabNavigator} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

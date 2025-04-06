import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import { RootState } from "../redux/store";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Main Screens
import AdmissionsScreen from "../screens/AdmissionsScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
// import FeesScreen from '../screens/FeesScreen';
// import FeesScreen from '../screens/FeesScreenNew';
import { StatusBar } from "expo-status-bar";
import FeesScreen from "../screens/FeeManagement/FeeScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen.jsx";
import ReportsScreen from "../screens/ReportsScreen";
import ResultsScreen from "../screens/ResultsScreen";
import StudentsScreen from "../screens/StudentsScreen";

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();

  const colors = {
    tabBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    tabActive: "#4A6FFF",
    tabInactive: theme === "dark" ? "#AAAAAA" : "#888888",
    statusBarBg: theme === "dark" ? "#121212" : "#F5F7FA",
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        { backgroundColor: colors.tabBackground },
      ]}
    >
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.statusBarBg}
      />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        switch (route.name) {
          case "Home":
            iconName = "home" as const;
            break;
          case "Students":
            iconName = "people" as const;
            break;
          case "Finances":
            iconName = "cash" as const;
            break;
          case "Reports":
            iconName = "analytics" as const;
            break;
          case "Settings":
            iconName = "settings" as const;
            break;
          default:
            iconName = "apps" as const;
        }

        return (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.tabBarButton}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? colors.tabActive : colors.tabInactive}
            />
            <Text
              style={[
                styles.tabBarLabel,
                { color: isFocused ? colors.tabActive : colors.tabInactive },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  // const { theme } = useTheme();

  // const colors = {
  //   background: theme === "dark" ? "#121212" : "#F5F7FA",
  //   cardBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
  //   tabBarBorder: theme === "dark" ? "#333333" : "#EEEEEE",
  // };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none", // We'll use our custom tab bar
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          tabBarLabel: "Students",
        }}
      />
      <Tab.Screen
        name="Finances"
        component={FeesScreen}
        options={{
          tabBarLabel: "Finances",
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: "Reports",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const { theme } = useTheme();

  const colors = {
    background: theme === "dark" ? "#121212" : "#F5F7FA",
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Admissions" component={AdmissionsScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  tabBarButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBarLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

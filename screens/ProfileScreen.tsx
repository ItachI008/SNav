import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import Font from "../constants/Font";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from '../FirebaseConfig';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userMobile, setUserMobile] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        // User is signed in
        try {
          const userDataSnapshot = await getDoc(doc(FIRESTORE_DB, "users", user.uid)); // Include user's UID in the document path
          if (userDataSnapshot.exists()) {
            const userData = userDataSnapshot.data();
            setUserName(userData.name);
            setUserEmail(userData.email);
            setUserMobile(userData.mobile);
          } else {
            throw new Error("User data not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          Alert.alert("Error", "Failed to fetch user data. Please try again later.");
        }
      } else {
        // No user is signed in, navigate to login screen
        navigation.navigate('Login');
      }
    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileBox}>
        <View style={styles.labelBox}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{userName}</Text>
        </View>
      </View>
      <View style={styles.profileBox}>
        <View style={styles.labelBox}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userEmail}</Text>
        </View>
      </View>
      <View style={styles.profileBox}>
        <View style={styles.labelBox}>
          <Text style={styles.label}>Mobile</Text>
          <Text style={styles.value}>{userMobile}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing,
  },
  profileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing * 2,
    width: '100%',
  },
  labelBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing * 2,
    borderWidth: 3,
    borderColor: '#1F41BB',
    backgroundColor: Colors.lightPrimary,
    borderRadius: Spacing,
    marginRight: Spacing,
   },
  valueBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing * 2,
    backgroundColor: Colors.lightPrimary,
    borderRadius: Spacing,
  },
  label: {
    fontFamily: Font["poppins-bold"],
    fontSize: FontSize.large,
    color: Colors.text,
    borderColor:"blue",
  },
  value: {
    fontFamily: Font["poppins-regular"],
    fontSize: FontSize.small,
    color: Colors.darkText,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing,
    paddingHorizontal: Spacing * 2,
    borderRadius: Spacing,
    marginTop: Spacing * 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: FontSize.large,
    textAlign: 'center',
    fontFamily: Font["poppins-bold"],
  },
});

export default ProfileScreen;

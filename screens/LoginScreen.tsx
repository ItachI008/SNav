import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import Font from "../constants/Font";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import AppTextInput from "../components/AppTextInput";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      
      // Check if the user's email is verified
      if (!user.emailVerified) {
        Alert.alert("Error", "Please verify your email address before signing in.");
        setLoading(false);
        return;
      }

      // Navigate to home screen upon successful sign-in
      navigation.navigate("Home");
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert("Error", "Failed to sign in. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View style={{ padding: Spacing * 2 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: FontSize.xLarge, color: Colors.primary, fontFamily: Font["poppins-bold"], marginVertical: Spacing * 3 }}>
            Welcome Back!
          </Text>
          <Text style={{ fontFamily: Font["poppins-regular"], fontSize: FontSize.small, maxWidth: "80%", textAlign: "center" }}>
            Sign in to continue exploring places
          </Text>
        </View>
        <View style={{ marginVertical: Spacing * 3 }}>
          <AppTextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <AppTextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        </View>
        <TouchableOpacity onPress={signIn} style={styles.button}>
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Sign in"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ padding: Spacing }}>
          <Text style={{ fontFamily: Font["poppins-semiBold"], color: Colors.text, textAlign: "center", fontSize: FontSize.small }}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing * 2,
    marginVertical: Spacing * 3,
    borderRadius: Spacing,
  },
  buttonText: {
    fontFamily: Font["poppins-bold"],
    color: Colors.onPrimary,
    textAlign: "center",
    fontSize: FontSize.large,
  },
});

export default LoginScreen;

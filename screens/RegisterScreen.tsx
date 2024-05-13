import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import Font from "../constants/Font";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import AppTextInput from "../components/AppTextInput";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      // Basic validation
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
      // Password validation
      const isValidPassword = validatePassword(password);
      if (!isValidPassword) {
        Alert.alert("Error", "Password should be at least 6 characters long and contain at least one special character, one number, one uppercase letter, and one lowercase letter");
        return;
      }
      
      // Firebase authentication
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendVerificationEmail(user);
  
      // Store additional user data in Firestore
      await addUserDataToFirestore(user.uid, name, mobile, email);
  
      // Navigate to login screen upon successful sign-up
      navigation.navigate("Login");
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "Failed to sign up. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      Alert.alert("Success", "Verification email sent. Please verify your email address before continuing.");
    } catch (error) {
      console.error("Email verification error:", error);
      Alert.alert("Error", "Failed to send verification email. Please try again later.");
    }
  };
  
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const addUserDataToFirestore = async (userId: string, name: string, mobile: string, email: string) => {
    try {
      // Use setDoc function to add user data to Firestore
      await setDoc(doc(FIRESTORE_DB, "users", userId), { name, mobile, email });
      console.log("User data added to Firestore");
    } catch (error) {
      console.error("Error adding user data to Firestore:", error);
    }
  };

  return (
    <SafeAreaView>
      <View style={{ padding: Spacing * 2 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: FontSize.xLarge, color: Colors.primary, fontFamily: Font["poppins-bold"], marginVertical: Spacing * 3 }}>
            Create account
          </Text>
          <Text style={{ fontFamily: Font["poppins-regular"], fontSize: FontSize.small, maxWidth: "80%", textAlign: "center" }}>
            Create an account so you can explore places without worrying
          </Text>
        </View>
        <View style={{ marginVertical: Spacing * 3 }}>
          <AppTextInput value={name} onChangeText={setName} placeholder="Name" />
          <AppTextInput value={mobile} onChangeText={setMobile} placeholder="Mobile No." keyboardType="phone-pad" />
          <AppTextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <AppTextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          <AppTextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" secureTextEntry />
        </View>
        <TouchableOpacity onPress={signUp} style={styles.button}>
          <Text style={styles.buttonText}>
            {loading ? "Signing up..." : "Sign up"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ padding: Spacing }}>
          <Text style={{ fontFamily: Font["poppins-semiBold"], color: Colors.text, textAlign: "center", fontSize: FontSize.small }}>
            Already have an account
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

export default RegisterScreen;

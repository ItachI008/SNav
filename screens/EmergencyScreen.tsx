import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import Font from "../constants/Font";
import AppTextInput from "../components/AppTextInput";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { getAuth } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "EmergencyContact">;

const EmergencyContact: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [userEmergencyContacts, setUserEmergencyContacts] = useState([]);

  const currentUser = getAuth().currentUser;

  useEffect(() => {
    const fetchUserEmergencyContacts = async () => {
      try {
        if (currentUser) {
          const userContactsQuery = query(collection(FIRESTORE_DB, "emergencyContacts"), 
            where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(userContactsQuery);
          const contacts = querySnapshot.docs.map((doc) => doc.data());
          setUserEmergencyContacts(contacts);
        }
      } catch (error) {
        console.error("Error fetching user's emergency contacts:", error);
      }
    };
    fetchUserEmergencyContacts();
  }, [currentUser]);

  const addEmergencyContact = async () => {
    // Check if the user has already added three emergency contacts
    if (userEmergencyContacts.length >= 3) {
      Alert.alert("Limit Exceeded", "Maximum emergency contact limit exceeded. You can only add up to 3 emergency contacts.");
      return;
    }
  
    // Basic validation
    if (!name || !contactNumber) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    // Validate contact number
    const contactRegex = /^[6-9]\d{9}$/; // Regex to match 10-digit number starting with 6, 7, 8, or 9
    if (!contactRegex.test(contactNumber)) {
      Alert.alert("Error", "Please input a valid contact number");
      return;
    }
    // Prepend country code +91 to the contact number
    const formattedContactNumber = "+91" + contactNumber;
  
    // Add emergency contact to Firestore
    try {
      if (currentUser) {
        await setDoc(doc(FIRESTORE_DB, "emergencyContacts", name), { name, contactNumber: formattedContactNumber, userId: currentUser.uid });
        Alert.alert("Success", "Emergency contact added successfully");
        setName("");
        setContactNumber("");
  
        // Update the user's emergency contacts after adding a new contact
        const updatedUserContactsQuery = query(collection(FIRESTORE_DB, "emergencyContacts"), 
          where("userId", "==", currentUser.uid));
        const updatedQuerySnapshot = await getDocs(updatedUserContactsQuery);
        const updatedContacts = updatedQuerySnapshot.docs.map((doc) => doc.data());
        setUserEmergencyContacts(updatedContacts);
      }
    } catch (error) {
      console.error("Error adding emergency contact to Firestore:", error);
      Alert.alert("Error", "Failed to add emergency contact. Please try again later.");
    }
  };
  

  return (
    <SafeAreaView>
      <View style={{ padding: Spacing * 2 }}>
        <AppTextInput value={name} onChangeText={setName} placeholder="Name" />
        <AppTextInput value={contactNumber} onChangeText={setContactNumber} placeholder="Contact Number" keyboardType="numeric" />
        <TouchableOpacity onPress={addEmergencyContact} style={styles.addButton}>
          <Text style={styles.buttonText}>Add Emergency Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Contacts")} style={styles.viewButton}>
          <Text style={styles.buttonText2}>View Emergency Contacts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: Colors.primary,
    padding: Spacing * 2,
    marginVertical: Spacing * 3,
    borderRadius: Spacing,
  },
  viewButton: {
    padding: Spacing * 2,
  },
  buttonText: {
    fontFamily: Font["poppins-bold"],
    color: Colors.onPrimary,
    textAlign: "center",
    fontSize: FontSize.large,
  },
  buttonText2: {
    fontFamily: Font["poppins-bold"],
    color: Colors.text,
    textAlign: "center",
    fontSize: FontSize.large,
  },
});

export default EmergencyContact;

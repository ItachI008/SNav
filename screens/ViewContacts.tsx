import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Colors from "../constants/Colors";
import Font from "../constants/Font";
import { getAuth } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';

const EmergencyContactsScreen = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      try {
        if (currentUser) {
          const userContactsQuery = query(collection(FIRESTORE_DB, "emergencyContacts"), where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(userContactsQuery);
          const contacts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setEmergencyContacts(contacts);
        }
      } catch (error) {
        console.error("Error fetching emergency contacts:", error);
      }
    };
    fetchEmergencyContacts();
  }, [currentUser]);

  const deleteEmergencyContact = async (contactId) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, "emergencyContacts", contactId));
      setEmergencyContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId));
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      Alert.alert("Error", "Failed to delete emergency contact. Please try again later.");
    }
  };

  const renderEmergencyContact = ({ item }) => (
    <View style={styles.contactContainer}>
      <Text style={styles.contactName}>{item.name}</Text>
      <Text style={styles.contactNumber}>{item.contactNumber}</Text>
      <TouchableOpacity onPress={() => showDeleteConfirmation(item.id)}>
        <Ionicons name="trash-outline" size={24} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );

  const showDeleteConfirmation = (contactId) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this emergency contact?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEmergencyContact(contactId),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={emergencyContacts}
        renderItem={renderEmergencyContact}
        keyExtractor={(item) => item.id} // Use unique ID as key
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No emergency contacts found</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing * 1,
    marginTop: Spacing * 10,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing,
    paddingHorizontal: Spacing * 2,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: Spacing,
    marginBottom: Spacing,
    backgroundColor:Colors.lightPrimary,
  },
  contactName: {
    fontFamily: Font["poppins-bold"],
    fontSize: FontSize.medium,
    color: Colors.text,
  },
  contactNumber: {
    fontFamily: Font["poppins-regular"],
    fontSize: FontSize.small,
    color: Colors.darkText,
  },
  emptyText: {
    fontFamily: Font["poppins-regular"],
    fontSize: FontSize.medium,
    color: Colors.text,
    textAlign: "center",
    marginTop: Spacing * 2,
  },
});

export default EmergencyContactsScreen;

import React, { useState,  } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import Colors from "../constants/Colors";
import Spacing from "../constants/Spacing";
import FontSize from "../constants/FontSize";
import Font from "../constants/Font";
import { Picker } from "@react-native-picker/picker";
import AppTextInput from "../components/AppTextInput";

const TagSelectionScreen = () => {
  const [tag, setTag] = useState("");
  const [word, setWord] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(collection(FIRESTORE_DB, "tagData"), {
        tag,
        word,
        from,
        to,
        createdAt: Timestamp.now(),
      });
      console.log("Document written with ID: ", docRef.id);
      Alert.alert("Success", "Feedback submitted successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Failed to submit data. Please try again later.");
    }
  };

  return (
    <View style={{ padding: Spacing }}>
      <Text style={styles.label}>Select Tag:</Text>
      <Picker
        selectedValue={tag}
        onValueChange={(itemValue) => setTag(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Tag" value="" />
        <Picker.Item label="Theft" value="Theft" />
        <Picker.Item label="Ongoing Work" value="Ongoing Work" />
        <Picker.Item label="Crime" value="Crime" />
        <Picker.Item label="Not Safe" value="Not Safe" />
      </Picker>
      <Text style={styles.label}>Place:</Text>
      <View style={{ marginVertical: Spacing * 0 }}>
          <AppTextInput value={word}
        onChangeText={setWord}
        placeholder="Enter palce where incident took place "
         />
        </View>
        <Text style={styles.label}>From:</Text>
        <View style={{ marginVertical: Spacing * 0 }}>
          <AppTextInput value={from}
        onChangeText={setFrom}
        placeholder="From"
         />
        </View>
        <Text style={styles.label}>To:</Text>
        <View style={{ marginVertical: Spacing * 0 }}>
          <AppTextInput value={to}
        onChangeText={setTo}
        placeholder="To"
         />
        </View>
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  label: {
    fontFamily: Font["poppins-bold"],
    fontSize: FontSize.medium,
    color: Colors.text,
    marginBottom: Spacing / 2,
  },
  picker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing * 2,
    backgroundColor: Colors.lightPrimary,
    marginRight: Spacing,
  },
  input: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing * 3,
    borderWidth: 2,
    borderColor: '#1F41BB',
    backgroundColor: Colors.lightPrimary,
    borderRadius: Spacing,
    marginRight: Spacing,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: Spacing * 2,
    marginVertical: Spacing * 3,
    borderRadius: Spacing,
  },
  submitButtonText: {
    fontFamily: Font["poppins-bold"],
    color: Colors.onPrimary,
    textAlign: "center",
    fontSize: FontSize.large,
    
  },
};

export default TagSelectionScreen;



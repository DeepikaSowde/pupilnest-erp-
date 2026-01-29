import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// MAKE SURE YOU HAVE DashboardScreen.js IN THE SAME FOLDER
import DashboardScreen from './DashboardScreen'; 

// --- REGISTRATION SCREEN COMPONENT ---
const RegistrationScreen = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    contact: '',
    aadhaar: '',
    studentClass: '', 
    stream: '',      
    board: '',
    schoolName: '',
    address: '',
    schoolAddress: ''
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.userName || !formData.password) {
      Alert.alert("Validation Error", "Please fill in all mandatory fields marked with *");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const API_URL = 'https://pupilnest-erp.onrender.com/signup'; 
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success", "Student Registered Successfully!");
        onBack(); 
      } else {
        Alert.alert("Registration Failed", result.message || "Unknown Database Error");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.regContainer}>
       <View style={styles.regHeader}>
          <Text style={styles.regTitle}>Student Registration Form</Text>
       </View>

       <ScrollView contentContainerStyle={styles.regScroll}>
          <View style={styles.regFormGrid}>
            {/* Shortened for brevity - Assuming fields remain same as your original code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} placeholder="Enter Name" value={formData.name} onChangeText={(t) => handleChange('name', t)} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>User Name <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} placeholder="Enter User Name" value={formData.userName} onChangeText={(t) => handleChange('userName', t)} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} secureTextEntry placeholder="Enter Password" value={formData.password} onChangeText={(t) => handleChange('password', t)} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} secureTextEntry placeholder="Re-enter Password" value={formData.confirmPassword} onChangeText={(t) => handleChange('confirmPassword', t)} />
            </View>
            {/* Add other fields here if needed based on previous code */}
          </View>

          <View style={styles.regButtonRow}>
             <TouchableOpacity style={[styles.button, styles.btnSuccess]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Submit</Text>}
             </TouchableOpacity>
             <TouchableOpacity style={[styles.button, styles.btnDanger]} onPress={onBack}>
                <Text style={styles.btnText}>Close</Text>
             </TouchableOpacity>
          </View>
          <View style={{height: 40}} />
       </ScrollView>
    </View>
  );
}

// --- MAIN APP COMPONENT (LOGIN) ---
export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false); // NEW: Loading state for login

  // Navigation State: 'login', 'dashboard', 'register'
  const [currentScreen, setCurrentScreen] = useState('login');

  // --- UPDATED LOGIN FUNCTION ---
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Validation", "Please enter Username and Password");
      return;
    }

    setLoading(true); // Start Spinner

    try {
      // API Call to your Backend
      const API_URL = 'https://pupilnest-erp.onrender.com/login'; 

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userName: username, 
          password: password 
        }),
      });

      const result = await response.json();

      if (result.success) {
        // SUCCESS: Switch to Dashboard
        setCurrentScreen('dashboard'); 
      } else {
        // FAIL: Show error from server
        Alert.alert("Login Failed", result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false); // Stop Spinner
    }
  };

  // SCREEN SWITCHING
  if (currentScreen === 'dashboard') {
    return <DashboardScreen onLogout={() => setCurrentScreen('login')} />;
  }

  if (currentScreen === 'register') {
    return <RegistrationScreen onBack={() => setCurrentScreen('login')} />;
  }

  // LOGIN SCREEN UI
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg' }}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerSkew} />
            <Text style={styles.headerText}>Sign In</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Username */}
            <Text style={styles.label}>Username <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />

            {/* Password */}
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={24} color="grey" 
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <MaterialCommunityIcons 
                name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={24} color="#666" 
              />
              <Text style={styles.checkboxLabel}>Remember Sign-in</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              
              {/* Sign In Button (With Spinner) */}
              <TouchableOpacity 
                style={[styles.button, styles.btnPrimary]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.btnText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.btnDanger]}
                onPress={() => { setUsername(''); setPassword(''); }}
              >
                <Text style={styles.btnText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.btnSuccess]} onPress={() => setCurrentScreen('register')}>
                <Text style={styles.btnText}>Sign Up</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.footerLinks}>
                <TouchableOpacity>
                      <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  imageContainer: { alignItems: 'center', marginBottom: 20, marginTop: 40 },
  illustration: { width: 250, height: 180 },
  card: { backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, overflow: 'hidden' },
  cardHeader: { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 10 },
  headerSkew: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0d47a1', transform: [{ skewY: '-3deg' }, {translateY: -20}], height: 140, width: '100%' },
  headerText: { color: 'white', fontSize: 28, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginTop: 10 },
  formContainer: { padding: 20, paddingTop: 10 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, marginTop: 10 },
  required: { color: 'red' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fff' },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  eyeIcon: { padding: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 20 },
  checkboxLabel: { marginLeft: 8, color: '#333' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#002b5c' },
  btnDanger: { backgroundColor: '#dc3545' },
  btnSuccess: { backgroundColor: '#28a745' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  footerLinks: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0d47a1', textDecorationLine: 'underline' },

  // --- REGISTRATION SCREEN STYLES ---
  regContainer: { flex: 1, backgroundColor: '#fcfcfc' },
  regHeader: { paddingVertical: 20, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  regTitle: { fontSize: 24, color: '#0f5132', fontWeight: 'bold' },
  regScroll: { padding: 15 },
  regFormGrid: { flexDirection: 'column' },
  inputGroup: { width: '100%', marginBottom: 15 },
  regButtonRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 20 },
});
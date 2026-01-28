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

// MAKE SURE YOU HAVE THIS FILE IN THE SAME FOLDER
import DashboardScreen from './DashboardScreen'; 

// --- REGISTRATION SCREEN COMPONENT (Connected to Database) ---
const RegistrationScreen = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. STATE: Holds all the form data to send to the server
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

  // Helper to update specific fields
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // 2. SUBMIT FUNCTION: Sends data to Node.js Server
  const handleSubmit = async () => {
    // --- Validation ---
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
      // --- API CALL ---
      // Use 'http://10.0.2.2:5005/signup' for Android Emulator
      // Use 'http://YOUR_PC_IP:5005/signup' for Real Device (e.g., 192.168.1.5)
      const API_URL = 'http://10.249.125.39:5005/signup'; 

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success", "Student Registered Successfully!");
        // Optional: Clear form or go back
        onBack(); 
      } else {
        Alert.alert("Registration Failed", result.message || "Unknown Database Error");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Could not connect to server. Is 'node server.js' running?");
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

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your name with initial" 
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            {/* User Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>User Name <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your User name"
                value={formData.userName}
                onChangeText={(text) => handleChange('userName', text)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                 <TextInput 
                    style={styles.passwordInput} 
                    secureTextEntry={true} 
                    placeholder="Enter Password" 
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                 />
                 <MaterialCommunityIcons name="eye-off" size={20} color="grey" style={{paddingRight:10}}/>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.passwordContainer}>
                 <TextInput 
                    style={styles.passwordInput} 
                    secureTextEntry={true} 
                    placeholder="Re-enter Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                 />
                 <MaterialCommunityIcons name="eye-off" size={20} color="grey" style={{paddingRight:10}}/>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your Email" 
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
            </View>

            {/* Father Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Father Name <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your Father name"
                value={formData.fatherName}
                onChangeText={(text) => handleChange('fatherName', text)}
              />
            </View>

            {/* DOB */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DOB <Text style={styles.required}>*</Text></Text>
              <View style={styles.iconInputContainer}>
                <TextInput 
                    style={styles.passwordInput} 
                    placeholder="dd-mm-yyyy" 
                    value={formData.dob}
                    onChangeText={(text) => handleChange('dob', text)}
                />
                <MaterialCommunityIcons name="calendar" size={20} color="grey" style={{paddingRight:10}}/>
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity style={styles.radioButton} onPress={() => handleChange('gender', 'Male')}>
                  <MaterialCommunityIcons name={formData.gender === 'Male' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#002b5c" />
                  <Text style={styles.radioText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.radioButton} onPress={() => handleChange('gender', 'Female')}>
                  <MaterialCommunityIcons name={formData.gender === 'Female' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#002b5c" />
                  <Text style={styles.radioText}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your Contact Number" 
                keyboardType="phone-pad"
                value={formData.contact}
                onChangeText={(text) => handleChange('contact', text)}
              />
            </View>

            {/* Aadhaar */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aadhaar Number <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your Aadhaar No" 
                keyboardType="numeric"
                value={formData.aadhaar}
                onChangeText={(text) => handleChange('aadhaar', text)}
              />
            </View>

            {/* Class */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Class <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 10th / 12th"
                value={formData.studentClass}
                onChangeText={(text) => handleChange('studentClass', text)}
              />
            </View>

            {/* Scheme / Stream */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Scheme/Stream <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Science / Commerce"
                value={formData.stream}
                onChangeText={(text) => handleChange('stream', text)}
              />
            </View>

             {/* Board */}
             <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Board <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. CBSE / State"
                value={formData.board}
                onChangeText={(text) => handleChange('board', text)}
              />
            </View>

            {/* School Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>School Name <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your School Name"
                value={formData.schoolName}
                onChangeText={(text) => handleChange('schoolName', text)}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Personal Address <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={[styles.input, {height: 80, textAlignVertical:'top'}]} 
                multiline={true} 
                placeholder="Enter your Address"
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
              />
            </View>

            {/* School Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>School Address <Text style={styles.required}>*</Text></Text>
              <TextInput 
                style={[styles.input, {height: 80, textAlignVertical:'top'}]} 
                multiline={true} 
                placeholder="Enter your School Address"
                value={formData.schoolAddress}
                onChangeText={(text) => handleChange('schoolAddress', text)}
              />
            </View>

          </View>

          {/* Action Buttons */}
          <View style={styles.regButtonRow}>
             <TouchableOpacity style={[styles.button, styles.btnSuccess]} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.btnText}>Submit</Text>
                )}
             </TouchableOpacity>
             
             <TouchableOpacity style={[styles.button, {backgroundColor: '#007bff'}]} onPress={() => setFormData({})}>
                <Text style={styles.btnText}>Clear</Text>
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

// --- MAIN APP COMPONENT ---
export default function App() {
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Navigation State: 'login', 'dashboard', 'register'
  const [currentScreen, setCurrentScreen] = useState('login');

  // Function to handle login
  const handleLogin = () => {
    // Basic validation check
    if(password === '12345') {
        setCurrentScreen('dashboard'); // Switch to Dashboard
    } else {
        Alert.alert("Login Failed", "Invalid password. (Try '12345')");
    }
  };

  // If logged in, show Dashboard instead of Login Form
  if (currentScreen === 'dashboard') {
    return <DashboardScreen onLogout={() => setCurrentScreen('login')} />;
  }

  // If registering, show Registration Screen
  if (currentScreen === 'register') {
    return <RegistrationScreen onBack={() => setCurrentScreen('login')} />;
  }

  // Otherwise, show Login Screen
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Illustration Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-vector/college-university-students-group-young-happy-people-standing-isolated-white-background_575670-66.jpg' }}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Login Card Section */}
        <View style={styles.card}>
          
          <View style={styles.cardHeader}>
            <View style={styles.headerSkew} />
            <Text style={styles.headerText}>Sign In</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Username Input */}
            <Text style={styles.label}>Username or Admission/Enrollment No <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Username or 5-digit Admission No"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />

            {/* Password Input */}
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="grey" 
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <MaterialCommunityIcons 
                name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={24} 
                color="#666" 
              />
              <Text style={styles.checkboxLabel}>Remember Sign-in</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              
              {/* Sign In */}
              <TouchableOpacity 
                style={[styles.button, styles.btnPrimary]}
                onPress={handleLogin}
              >
                <Text style={styles.btnText}>Sign In</Text>
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
  iconInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fff', height: 49 },
  radioGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  radioButton: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  radioText: { marginLeft: 5, color: '#333' },
  regButtonRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 20 },
});
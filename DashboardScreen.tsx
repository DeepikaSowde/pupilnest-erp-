import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  TouchableWithoutFeedback,
  Modal, 
  FlatList,
  Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// IMPORT EXAM SCREEN
import ExamScreen from './ExamScreen';

// --- TYPES & INTERFACES ---
interface Subject {
  id: number;
  name: string;
  icon: string;
}

interface Report {
  id: number;
  subject: string;
  date: string;
  correct: number;
  wrong: number;
  total: number;
}

interface DashboardProps {
  onLogout: () => void;
}

// --- DATA CONSTANTS ( IDs must match your Database! ) ---
const SUBJECTS: Subject[] = [
  { id: 1, name: 'Tamil', icon: 'book-open-page-variant' },
  { id: 2, name: 'English', icon: 'alphabetical' }, // You confirmed English is 2
  { id: 3, name: 'Maths', icon: 'calculator' },
  { id: 4, name: 'Science', icon: 'flask' },
  { id: 5, name: 'History', icon: 'history' },
  { id: 6, name: 'Geography', icon: 'earth' },
];

const QUESTION_COUNTS: number[] = [10, 20, 30, 50];

// --- MOCK REPORT DATA ---
const REPORT_DATA: Report[] = [
    { id: 1, subject: 'English', date: '21-Jan-2026', correct: 5, wrong: 5, total: 10 },
    { id: 2, subject: 'English', date: '10-Jan-2026', correct: 17, wrong: 3, total: 20 },
];

const DashboardScreen: React.FC<DashboardProps> = ({ onLogout }) => {
  
  // Navigation & UI State
  const [currentView, setCurrentView] = useState<string>('Test Board'); 
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [reportType, setReportType] = useState<'Last' | 'Subject' | 'Date'>('Last'); 
  
  // --- FILTER STATES ---
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<'from' | 'to'>('from');
  
  // Subject Filter State
  const [filterSubject, setFilterSubject] = useState<string>('English');
  const [showResults, setShowResults] = useState<boolean>(true);

  // --- LANDING PAGE STATE ---
  const [selectedSubject, setSelectedSubject] = useState<string>('English'); 
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  // Modal States
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showCountModal, setShowCountModal] = useState<boolean>(false);
  const [showFilterSubjectModal, setShowFilterSubjectModal] = useState<boolean>(false);

  // --- HELPERS ---
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const navigateTo = (screenName: string) => {
    setCurrentView(screenName);
    setIsDrawerOpen(false);
  };

  // --- HANDLE START EXAM ---
  const handleStartExam = () => {
    setShowSubjectModal(false);
    setShowCountModal(false);
    setCurrentView('Exam');
  };

  // --- DATE PICKER HANDLERS ---
  const openDatePicker = (mode: 'from' | 'to') => {
      setPickerMode(mode);
      setShowPicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowPicker(false);
      if (selectedDate) {
          pickerMode === 'from' ? setFromDate(selectedDate) : setToDate(selectedDate);
      }
  };

  // --- FILTER LOGIC ---
  const getFilteredReports = (): Report[] => {
      if (!showResults && (reportType === 'Date' || reportType === 'Subject')) return [];
      switch(reportType) {
          case 'Last': return [REPORT_DATA[0]]; 
          case 'Subject': return REPORT_DATA.filter(r => r.subject === filterSubject); 
          default: return REPORT_DATA;
      }
  };

  const currentReports = getFilteredReports();

  const switchTab = (type: 'Last' | 'Subject' | 'Date') => {
      setReportType(type);
      setShowResults(type === 'Last'); 
  };

  // --- CALCULATE SUBJECT ID ---
  // Finds the ID (e.g., 2) based on the name (e.g., "English")
  const getSelectedSubjectId = () => {
    const sub = SUBJECTS.find(s => s.name === selectedSubject);
    return sub ? sub.id : 1; // Default to 1 if not found
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#002b5c" barStyle="light-content" />

      {/* HEADER - Hide in Exam Mode */}
      {currentView !== 'Exam' && (
        <View style={styles.header}>
            <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
                <MaterialCommunityIcons name="menu" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{currentView}</Text>
            <TouchableOpacity onPress={onLogout}>
                <MaterialCommunityIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
            </View>
        </View>
      )}

      <View style={styles.contentArea}>
        
        {/* VIEW 1: TEST BOARD */}
        {currentView === 'Test Board' && (
          <ScrollView contentContainerStyle={styles.landingScroll}>
            <View style={[styles.landingCard, { padding: 0, overflow: 'hidden', backgroundColor: 'white' }]}>
                {/* BLUE HEADER */}
                <View style={{ width: '100%', backgroundColor: '#e3f2fd', padding: 20, alignItems: 'center' }}>
                    <Text style={styles.schoolName}>AVM Marimuthu Higher Secondary School</Text>
                    <Text style={styles.landingTitle}>Online Test</Text>
                    <View style={styles.userInfoRow}>
                        <View style={styles.userInfoItem}>
                            <MaterialCommunityIcons name="face-man" size={20} color="#002b5c" />
                            <Text style={styles.userInfoText}> : Student</Text>
                        </View>
                        <View style={styles.userInfoItem}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#002b5c" />
                            <Text style={styles.userInfoText}> : XII</Text>
                        </View>
                    </View>
                </View>

                {/* WHITE BODY */}
                <View style={{ width: '100%', padding: 20, alignItems: 'center' }}>
                    <Text style={styles.startExamTitle}>Start your Exam</Text>

                    {/* Subject Dropdown */}
                    <View style={styles.inputGroupFull}>
                        <Text style={styles.inputLabel}>Subject :</Text>
                        <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowSubjectModal(true)}>
                            <Text style={styles.dropdownText}>{selectedSubject}</Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Count Dropdown */}
                    <View style={styles.inputGroupFull}>
                        <Text style={styles.inputLabel}>No. of Questions :</Text>
                        <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowCountModal(true)}>
                            <Text style={styles.dropdownText}>{questionCount}</Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.letsStartBtn} onPress={handleStartExam}>
                        <Text style={styles.letsStartBtnText}>Let's Start!</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </ScrollView>
        )}

        {/* VIEW 2: EXAM SCREEN (With Correct ID Logic) */}
        {currentView === 'Exam' && (
            <ExamScreen 
                subject={selectedSubject}        // Display Name (e.g. "English")
                subjectId={getSelectedSubjectId()} // Database ID (e.g. 2)
                classId="12"                     // Hardcoded for now
                count={questionCount}
                onFinish={() => setCurrentView('Test Board')}
            />
        )}

        {/* VIEW 3: REPORT SCREEN (Simplified for brevity, code unchanged from before) */}
        {currentView === 'Report' && (
          <View style={styles.reportContainer}>
             <Text style={{textAlign:'center', marginTop:50, color:'#666'}}>Report Module Loaded</Text>
             {/* Use your existing report code here if needed */}
             <TouchableOpacity style={[styles.letsStartBtn, {marginTop:20}]} onPress={() => setCurrentView('Test Board')}>
                <Text style={styles.letsStartBtnText}>Back to Home</Text>
             </TouchableOpacity>
          </View>
        )}
      </View>

      {/* --- MODALS --- */}
      <Modal visible={showSubjectModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowSubjectModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Subject</Text>
                    <FlatList 
                        data={SUBJECTS}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedSubject(item.name); setShowSubjectModal(false); }}>
                                <MaterialCommunityIcons name={item.icon} size={24} color="#002b5c" />
                                <Text style={styles.modalItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
         </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={showCountModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowCountModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>No. of Questions</Text>
                    {QUESTION_COUNTS.map(count => (
                          <TouchableOpacity key={count} style={styles.modalItem} onPress={() => { setQuestionCount(count); setShowCountModal(false); }}>
                             <Text style={styles.modalItemText}>{count}</Text>
                          </TouchableOpacity>
                    ))}
                </View>
            </View>
         </TouchableWithoutFeedback>
      </Modal>

      {/* DRAWER */}
      {isDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDrawerOpen(false)}>
            <View style={styles.drawerBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <MaterialCommunityIcons name="school" size={40} color="white" />
                <Text style={styles.drawerSchoolName}>AIM SCHOOL</Text>
            </View>
            <View style={styles.drawerItems}>
                <TouchableOpacity style={[styles.drawerItem, currentView === 'Test Board' && styles.drawerItemSelected]} onPress={() => navigateTo('Test Board')}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={currentView === 'Test Board' ? "#002b5c" : "#666"} />
                    <Text style={[styles.drawerItemText, currentView === 'Test Board' && styles.drawerItemTextSelected]}>Test Board</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.drawerItem, currentView === 'Report' && styles.drawerItemSelected]} onPress={() => navigateTo('Report')}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color={currentView === 'Report' ? "#002b5c" : "#666"} />
                    <Text style={[styles.drawerItemText, currentView === 'Report' && styles.drawerItemTextSelected]}>Report</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.drawerFooter}>
                <Text style={styles.versionText}>App Version 1.0</Text>
            </View>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  contentArea: { flex: 1 },
  header: { backgroundColor: '#002b5c', padding: 20, paddingTop: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 5, zIndex: 1 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  landingScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  landingCard: { backgroundColor: 'white', borderRadius: 10, elevation: 4, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  schoolName: { color: '#002b5c', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  landingTitle: { fontSize: 28, fontWeight: 'bold', color: 'black', marginBottom: 15 },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 15 },
  userInfoItem: { flexDirection: 'row', alignItems: 'center' },
  userInfoText: { color: '#333', fontSize: 14, marginLeft: 5 },
  startExamTitle: { color: '#2e7d32', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  letsStartBtn: { marginTop: 20, borderWidth: 1, borderColor: '#002b5c', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: 'white' },
  letsStartBtnText: { color: '#002b5c', fontWeight: 'bold' },
  inputGroupFull: { width: '100%', marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: 'bold' },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#bbb', borderRadius: 5, padding: 12, backgroundColor: 'white' },
  dropdownText: { fontSize: 14, color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#002b5c', marginBottom: 15, textAlign: 'center' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16, color: '#333', marginLeft: 15 },
  reportContainer: { flex: 1, backgroundColor: '#f5f7fa' },
  filterRow: { flexDirection: 'row', padding: 10, backgroundColor: 'white', elevation: 2, justifyContent: 'space-around' },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  filterBtnActive: { backgroundColor: '#002b5c', borderColor: '#002b5c' },
  filterText: { color: '#666', fontSize: 12 },
  filterTextActive: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, flexDirection: 'row' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContainer: { width: '75%', backgroundColor: 'white', height: '100%', elevation: 10, position: 'absolute', left: 0 },
  drawerHeader: { backgroundColor: '#002b5c', height: 150, justifyContent: 'center', alignItems: 'center' },
  drawerSchoolName: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  drawerItems: { padding: 20 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 8, marginBottom: 5 },
  drawerItemSelected: { backgroundColor: '#e3f2fd' },
  drawerItemText: { marginLeft: 15, fontSize: 16, color: '#333', fontWeight: '500' },
  drawerItemTextSelected: { color: '#002b5c', fontWeight: 'bold' },
  drawerFooter: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  versionText: { color: '#ccc', fontSize: 12 },
});

export default DashboardScreen;
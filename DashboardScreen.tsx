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
  Alert,
  ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// IMPORT EXAM SCREEN
import ExamScreen from './ExamScreen';

// --- TYPES ---
interface Subject {
  id: number;
  name: string;
  icon: string;
}

interface ReportItem {
  id: number;
  subjectId: number;
  date: string;
  correct: number;
  wrong: number;
  total: number;
  score: number;
}

interface DashboardProps {
  onLogout: () => void;
}

// --- DATA CONSTANTS ---
const SUBJECTS: Subject[] = [
  { id: 1, name: 'Tamil', icon: 'book-open-page-variant' },
  { id: 2, name: 'English', icon: 'alphabetical' }, 
  { id: 3, name: 'Maths', icon: 'calculator' },
  { id: 4, name: 'Science', icon: 'flask' },
  { id: 5, name: 'History', icon: 'history' },
  { id: 6, name: 'Geography', icon: 'earth' },
];

const QUESTION_COUNTS: number[] = [10, 20, 30, 50];
const REPORT_TYPES = ['Last Test Report', 'Subject Wise Report', 'Date to Date Report'];

const DashboardScreen: React.FC<DashboardProps> = ({ onLogout }) => {
  
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<string>('Test Board'); 
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  
  // Landing Page State
  const [selectedSubject, setSelectedSubject] = useState<string>('English'); 
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showCountModal, setShowCountModal] = useState<boolean>(false);

  // REPORT SCREEN STATE
  const [reportType, setReportType] = useState<string>('Please Select');
  const [showReportTypeModal, setShowReportTypeModal] = useState<boolean>(false);
  
  // Report Filters
  const [filterSubject, setFilterSubject] = useState<string>('Select Subject');
  const [showFilterSubjectModal, setShowFilterSubjectModal] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<'from' | 'to'>('from');

  // Report Results
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // --- HELPERS ---
  const getSubjectName = (id: number) => SUBJECTS.find(s => s.id === id)?.name || 'Unknown';
  const getSubjectId = (name: string) => SUBJECTS.find(s => s.name === name)?.id || 0;

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // --- API: FETCH REPORTS ---
  const handleSearchReport = async () => {
    if (reportType === 'Please Select') {
      Alert.alert("Validation", "Please select a Report Type.");
      return;
    }
    if (reportType === 'Subject Wise Report' && filterSubject === 'Select Subject') {
      Alert.alert("Validation", "Please select a Subject.");
      return;
    }

    setLoadingReport(true);
    setReportData([]); // Clear previous results

    try {
      const response = await fetch('https://pupilnest-erp.onrender.com/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 1, // HARDCODED STUDENT ID (Replace with real logged-in ID)
          reportType: reportType,
          subjectId: reportType === 'Subject Wise Report' ? getSubjectId(filterSubject) : null,
          fromDate: reportType === 'Date to Date Report' ? formatDate(fromDate) : null,
          toDate: reportType === 'Date to Date Report' ? formatDate(toDate) : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        if (result.data.length === 0) Alert.alert("Info", "No records found.");
      } else {
        Alert.alert("Error", "Failed to fetch reports.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error.");
    } finally {
      setLoadingReport(false);
    }
  };

  const handleClearReport = () => {
    setReportType('Please Select');
    setFilterSubject('Select Subject');
    setReportData([]);
  };

  // --- DATE PICKER ---
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      pickerMode === 'from' ? setFromDate(selectedDate) : setToDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#002b5c" barStyle="light-content" />

      {/* HEADER */}
      {currentView !== 'Exam' && (
        <View style={styles.header}>
            <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
                <MaterialCommunityIcons name="menu" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AIM SCHOOL</Text>
            <TouchableOpacity onPress={onLogout}>
                <MaterialCommunityIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
            </View>
            <View style={styles.headerTabs}>
                <TouchableOpacity onPress={() => setCurrentView('Test Board')}><Text style={[styles.tabText, currentView === 'Test Board' && styles.activeTab]}>Test Board</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentView('Report')}><Text style={[styles.tabText, currentView === 'Report' && styles.activeTab]}>Report</Text></TouchableOpacity>
            </View>
        </View>
      )}

      <View style={styles.contentArea}>
        
        {/* --- VIEW 1: TEST BOARD --- */}
        {currentView === 'Test Board' && (
          <ScrollView contentContainerStyle={styles.landingScroll}>
            <View style={[styles.landingCard, { padding: 0, overflow: 'hidden', backgroundColor: 'white' }]}>
                <View style={{ width: '100%', backgroundColor: '#e3f2fd', padding: 20, alignItems: 'center' }}>
                    <Text style={styles.schoolName}>AVM Marimuthu Higher Secondary School</Text>
                    <Text style={styles.landingTitle}>Online Test</Text>
                    <View style={styles.userInfoRow}>
                        <Text style={styles.userInfoText}>👤 : Student</Text>
                        <Text style={styles.userInfoText}>💳 : XII</Text>
                    </View>
                </View>
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
                    <TouchableOpacity style={styles.letsStartBtn} onPress={() => { setShowSubjectModal(false); setShowCountModal(false); setCurrentView('Exam'); }}>
                        <Text style={styles.letsStartBtnText}>Let's Start!</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </ScrollView>
        )}

        {/* --- VIEW 2: EXAM SCREEN --- */}
        {currentView === 'Exam' && (
            <ExamScreen 
                subject={selectedSubject}        
                subjectId={getSubjectId(selectedSubject)} 
                classId="12"                     
                count={questionCount}
                studentId={1} 
                onFinish={() => setCurrentView('Test Board')}
            />
        )}

        {/* --- VIEW 3: REPORT SCREEN (MATCHING SCREENSHOT) --- */}
        {currentView === 'Report' && (
          <View style={styles.reportContainer}>
             <Text style={styles.reportHeaderTitle}>Student Exam Reports</Text>
             
             <View style={styles.filterCard}>
                {/* 1. Report Type Dropdown */}
                <Text style={styles.inputLabel}>Report Type <Text style={{color:'red'}}>*</Text></Text>
                <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowReportTypeModal(true)}>
                    <Text style={styles.dropdownText}>{reportType}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                </TouchableOpacity>

                {/* 2. Dynamic Inputs */}
                {reportType === 'Subject Wise Report' && (
                    <View style={{marginTop: 15}}>
                        <Text style={styles.inputLabel}>Subject <Text style={{color:'red'}}>*</Text></Text>
                        <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowFilterSubjectModal(true)}>
                            <Text style={styles.dropdownText}>{filterSubject}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}

                {reportType === 'Date to Date Report' && (
                    <View style={styles.dateRow}>
                        <View style={{flex:1, marginRight:10}}>
                            <Text style={styles.inputLabel}>From Date</Text>
                            <TouchableOpacity style={styles.dropdownBox} onPress={() => { setPickerMode('from'); setShowPicker(true); }}>
                                <Text style={styles.dropdownText}>{formatDate(fromDate)}</Text>
                                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.inputLabel}>To Date</Text>
                            <TouchableOpacity style={styles.dropdownBox} onPress={() => { setPickerMode('to'); setShowPicker(true); }}>
                                <Text style={styles.dropdownText}>{formatDate(toDate)}</Text>
                                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* 3. Action Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#ff9800'}]} onPress={handleSearchReport}>
                        <MaterialCommunityIcons name="magnify" size={18} color="white" />
                        <Text style={styles.actionBtnText}> Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#007bff'}]} onPress={handleClearReport}>
                        <Text style={styles.actionBtnText}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#dc3545'}]} onPress={() => setCurrentView('Test Board')}>
                        <Text style={styles.actionBtnText}>Close</Text>
                    </TouchableOpacity>
                </View>
             </View>

             {/* 4. Results List */}
             {loadingReport ? (
                 <ActivityIndicator size="large" color="#002b5c" style={{marginTop: 30}} />
             ) : (
                 <FlatList
                    data={reportData}
                    keyExtractor={(item) => item.id.toString()}
                    style={{marginTop: 15}}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({item}) => (
                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultSubject}>{getSubjectName(item.subjectId)}</Text>
                                <Text style={styles.resultDate}>{item.date}</Text>
                            </View>
                            <View style={styles.resultBody}>
                                <Text>Correct: <Text style={{color:'green', fontWeight:'bold'}}>{item.correct}</Text></Text>
                                <Text>Wrong: <Text style={{color:'red', fontWeight:'bold'}}>{item.wrong}</Text></Text>
                                <Text>Score: <Text style={{color:'#002b5c', fontWeight:'bold'}}>{Math.round(item.score)}%</Text></Text>
                            </View>
                        </View>
                    )}
                 />
             )}
          </View>
        )}
      </View>

      {/* --- ALL MODALS --- */}
      {/* 1. Subject Modal */}
      <Modal visible={showSubjectModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowSubjectModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Subject</Text>
                    <FlatList data={SUBJECTS} keyExtractor={item=>item.id.toString()} renderItem={({item})=>(
                        <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedSubject(item.name); setShowSubjectModal(false); }}>
                            <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}/>
                </View>
            </View>
         </TouchableWithoutFeedback>
      </Modal>

      {/* 2. Count Modal */}
      <Modal visible={showCountModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowCountModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Count</Text>
                    {QUESTION_COUNTS.map(count => (
                        <TouchableOpacity key={count} style={styles.modalItem} onPress={() => { setQuestionCount(count); setShowCountModal(false); }}>
                            <Text style={styles.modalItemText}>{count}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
         </TouchableWithoutFeedback>
      </Modal>

      {/* 3. Report Type Modal */}
      <Modal visible={showReportTypeModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowReportTypeModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Report Type</Text>
                    {REPORT_TYPES.map(type => (
                        <TouchableOpacity key={type} style={styles.modalItem} onPress={() => { setReportType(type); setShowReportTypeModal(false); }}>
                            <Text style={styles.modalItemText}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
         </TouchableWithoutFeedback>
      </Modal>

      {/* 4. Filter Subject Modal */}
      <Modal visible={showFilterSubjectModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowFilterSubjectModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Subject</Text>
                    <FlatList data={SUBJECTS} keyExtractor={item=>item.id.toString()} renderItem={({item})=>(
                        <TouchableOpacity style={styles.modalItem} onPress={() => { setFilterSubject(item.name); setShowFilterSubjectModal(false); }}>
                            <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}/>
                </View>
            </View>
         </TouchableWithoutFeedback>
      </Modal>

      {/* 5. Date Picker */}
      {showPicker && (
        <DateTimePicker value={pickerMode === 'from' ? fromDate : toDate} mode="date" display="default" onChange={onDateChange} />
      )}

      {/* DRAWER */}
      {isDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDrawerOpen(false)}><View style={styles.drawerBackdrop} /></TouchableWithoutFeedback>
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
                <MaterialCommunityIcons name="school" size={40} color="white" />
                <Text style={styles.drawerSchoolName}>AIM SCHOOL</Text>
            </View>
            <View style={styles.drawerItems}>
                <TouchableOpacity style={styles.drawerItem} onPress={() => {setCurrentView('Test Board'); setIsDrawerOpen(false);}}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#666" />
                    <Text style={styles.drawerItemText}>Test Board</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => {setCurrentView('Report'); setIsDrawerOpen(false);}}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#666" />
                    <Text style={styles.drawerItemText}>Report</Text>
                </TouchableOpacity>
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
  header: { backgroundColor: '#002b5c', padding: 15, elevation: 5 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerTabs: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 },
  tabText: { color: '#bbb', fontWeight: 'bold' },
  activeTab: { color: 'white', textDecorationLine: 'underline' },
  landingScroll: { padding: 20 },
  landingCard: { backgroundColor: 'white', borderRadius: 10, elevation: 4 },
  schoolName: { color: '#002b5c', fontWeight: 'bold', fontSize: 16, marginBottom: 10, textAlign:'center' },
  landingTitle: { fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 15, textAlign:'center' },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  userInfoText: { fontSize: 14, color: '#333' },
  startExamTitle: { color: '#2e7d32', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  letsStartBtn: { marginTop: 20, borderWidth: 1, borderColor: '#002b5c', borderRadius: 25, paddingVertical: 10, paddingHorizontal: 30 },
  letsStartBtnText: { color: '#002b5c', fontWeight: 'bold' },
  inputGroupFull: { width: '100%', marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: 'bold' },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, backgroundColor: 'white' },
  dropdownText: { fontSize: 14, color: '#333' },
  reportContainer: { padding: 20 },
  reportHeaderTitle: { fontSize: 20, color: '#0f5132', fontWeight: 'bold', marginBottom: 15 },
  filterCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, elevation: 2 },
  dateRow: { flexDirection: 'row', marginTop: 15 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  actionBtnText: { color: 'white', fontWeight: 'bold' },
  resultCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginTop: 10, elevation: 2, borderLeftWidth: 5, borderLeftColor: '#002b5c' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  resultSubject: { fontSize: 16, fontWeight: 'bold', color: '#002b5c' },
  resultDate: { fontSize: 12, color: '#666' },
  resultBody: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#002b5c', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16, color: '#333' },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, flexDirection: 'row' },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContainer: { width: '70%', backgroundColor: 'white', height: '100%', elevation: 10 },
  drawerHeader: { backgroundColor: '#002b5c', height: 150, justifyContent: 'center', alignItems: 'center' },
  drawerSchoolName: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  drawerItems: { padding: 20 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  drawerItemText: { marginLeft: 15, fontSize: 16, color: '#333' },
});

export default DashboardScreen;
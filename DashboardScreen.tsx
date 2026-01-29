import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  TouchableWithoutFeedback,
  Alert,
  Modal, 
  FlatList
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// IMPORT THE EXAM SCREEN (Make sure ExamScreen.tsx is in the same folder)
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

// --- MOCK REPORT DATA ---
const REPORT_DATA: Report[] = [
    { id: 1, subject: 'English', date: '21-Jan-2026', correct: 5, wrong: 5, total: 10 },
    { id: 2, subject: 'English', date: '10-Jan-2026', correct: 17, wrong: 3, total: 20 },
    { id: 3, subject: 'English', date: '10-Jan-2026', correct: 9, wrong: 1, total: 10 },
    { id: 4, subject: 'Tamil', date: '22-Jan-2026', correct: 8, wrong: 2, total: 10 },
    { id: 5, subject: 'Tamil', date: '20-Jan-2026', correct: 9, wrong: 1, total: 10 },
    { id: 6, subject: 'Maths', date: '18-Jan-2026', correct: 3, wrong: 7, total: 10 },
    { id: 7, subject: 'Science', date: '15-Jan-2026', correct: 10, wrong: 0, total: 10 },
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
  
  // Subject Filter State for Reports
  const [filterSubject, setFilterSubject] = useState<string>('English');
  const [showResults, setShowResults] = useState<boolean>(true);

  // --- LANDING PAGE STATE ---
  const [selectedSubject, setSelectedSubject] = useState<string>('Tamil'); 
  const [questionCount, setQuestionCount] = useState<number>(10);
  
  // Modal States
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showCountModal, setShowCountModal] = useState<boolean>(false);
  
  // Modal for Filter Subject (Report Screen)
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
    // Close dropdowns/modals
    setShowSubjectModal(false);
    setShowCountModal(false);
    
    // Switch View to Exam
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
          case 'Last': 
              return [REPORT_DATA[0]]; 
          case 'Subject': 
              return REPORT_DATA.filter(r => r.subject === filterSubject); 
          case 'Date': 
              // Logic to filter by date range would go here in a real app
              return REPORT_DATA; 
          default: 
              return REPORT_DATA;
      }
  };

  const currentReports = getFilteredReports();

  const switchTab = (type: 'Last' | 'Subject' | 'Date') => {
      setReportType(type);
      setShowResults(type === 'Last'); 
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
        
        {/* VIEW 1: TEST BOARD (LANDING PAGE) */}
        {currentView === 'Test Board' && (
          <ScrollView contentContainerStyle={styles.landingScroll}>
            
            <View style={[styles.landingCard, { padding: 0, overflow: 'hidden', backgroundColor: 'white' }]}>
                
                {/* 1. BLUE HEADER SECTION */}
                <View style={{ width: '100%', backgroundColor: '#e3f2fd', padding: 20, alignItems: 'center' }}>
                    <Text style={styles.schoolName}>AVM Marimuthu Higher Secondary School</Text>
                    <Text style={styles.landingTitle}>Online Test</Text>
                    
                    <View style={styles.userInfoRow}>
                        <View style={styles.userInfoItem}>
                            <MaterialCommunityIcons name="face-man" size={20} color="#002b5c" />
                            <Text style={styles.userInfoText}> : pavithra .C</Text>
                        </View>
                        <View style={styles.userInfoItem}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#002b5c" />
                            <Text style={styles.userInfoText}> : XII</Text>
                        </View>
                    </View>
                </View>

                {/* 2. WHITE BODY SECTION */}
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

        {/* VIEW 2: EXAM SCREEN (CONNECTED!) */}
        {currentView === 'Exam' && (
            <ExamScreen 
                subject={selectedSubject}
                classId="12" // You can make this dynamic later based on user profile
                count={questionCount}
                onFinish={() => setCurrentView('Test Board')}
            />
        )}

        {/* VIEW 3: REPORT SCREEN */}
        {currentView === 'Report' && (
          <View style={styles.reportContainer}>
            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                <TouchableOpacity style={[styles.filterBtn, reportType === 'Last' && styles.filterBtnActive]} onPress={() => switchTab('Last')}>
                    <Text style={[styles.filterText, reportType === 'Last' && styles.filterTextActive]}>Last Test</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterBtn, reportType === 'Subject' && styles.filterBtnActive]} onPress={() => switchTab('Subject')}>
                    <Text style={[styles.filterText, reportType === 'Subject' && styles.filterTextActive]}>Subject Wise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterBtn, reportType === 'Date' && styles.filterBtnActive]} onPress={() => switchTab('Date')}>
                    <Text style={[styles.filterText, reportType === 'Date' && styles.filterTextActive]}>Date Range</Text>
                </TouchableOpacity>
            </View>
            
            {/* Filter Inputs (Show only for Subject/Date) */}
            {(reportType === 'Date' || reportType === 'Subject') && (
                <View style={styles.filterOptionsContainer}>
                    
                    {/* Subject Filter Input */}
                    {reportType === 'Subject' && (
                        <View style={styles.inputGroupFull}>
                            <Text style={styles.inputLabel}>Subject <Text style={{color:'red'}}>*</Text></Text>
                            <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowFilterSubjectModal(true)}>
                                <Text style={styles.dropdownText}>{filterSubject}</Text>
                                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Date Filter Input */}
                    {reportType === 'Date' && (
                        <View style={styles.dateInputsRow}>
                            <View style={styles.dateInputGroup}>
                                <Text style={styles.inputLabel}>From Date</Text>
                                <TouchableOpacity style={styles.dropdownBox} onPress={() => openDatePicker('from')}>
                                    <Text style={styles.dropdownText}>{formatDate(fromDate)}</Text>
                                    <MaterialCommunityIcons name="calendar-month" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.dateInputGroup}>
                                <Text style={styles.inputLabel}>To Date</Text>
                                <TouchableOpacity style={styles.dropdownBox} onPress={() => openDatePicker('to')}>
                                    <Text style={styles.dropdownText}>{formatDate(toDate)}</Text>
                                    <MaterialCommunityIcons name="calendar-month" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={[styles.actionBtn, styles.btnSearch]} onPress={() => setShowResults(true)}>
                             <MaterialCommunityIcons name="magnify" size={18} color="white" />
                             <Text style={styles.actionBtnText}>Search</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.btnClear]} onPress={() => setShowResults(false)}>
                             <Text style={styles.actionBtnText}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.btnClose]}>
                             <Text style={styles.actionBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Hidden Date Picker */}
            {showPicker && (
                <DateTimePicker
                    value={pickerMode === 'from' ? fromDate : toDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}

            {/* Results Summary & List */}
            <View style={styles.resultSummary}>
                <Text style={styles.summaryTitle}>
                    {reportType === 'Last' && "Latest Performance"}
                    {reportType === 'Subject' && `${filterSubject} Performance`}
                    {reportType === 'Date' && "Date Range Results"}
                </Text>
                {showResults && ( <Text style={styles.summaryCount}>{currentReports.length} Records</Text> )}
            </View>

            <ScrollView contentContainerStyle={styles.reportList}>
                {showResults && currentReports.map((report) => (
                    <View key={report.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <View>
                                <Text style={styles.subjectTitle}>{report.subject}</Text>
                                <Text style={styles.examDate}>{report.date}</Text>
                            </View>
                            <View style={[styles.scoreBadge, report.correct < 5 ? {backgroundColor:'#ffebee'} : {backgroundColor:'#e8f5e9'}]}>
                                <Text style={[styles.scoreText, report.correct < 5 ? {color:'red'} : {color:'green'}]}>{report.correct} / {report.total}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statsRow}>
                            <View style={styles.stat}><MaterialCommunityIcons name="check-circle" size={16} color="green" /><Text style={styles.statText}>{report.correct} Correct</Text></View>
                            <View style={styles.stat}><MaterialCommunityIcons name="close-circle" size={16} color="red" /><Text style={styles.statText}>{report.wrong} Wrong</Text></View>
                            <View style={styles.stat}><Text style={[styles.statText, {fontWeight:'bold'}]}>{report.total} Qs</Text></View>
                        </View>
                    </View>
                ))}
                {showResults && currentReports.length === 0 && (
                    <Text style={{textAlign:'center', color:'#999', marginTop: 20}}>No records found for {filterSubject}.</Text>
                )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* --- MODALS --- */}
      
      {/* 1. Landing Page Subject Modal */}
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

      {/* 2. Landing Page Count Modal */}
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

      {/* 3. REPORT FILTER Subject Modal */}
      <Modal visible={showFilterSubjectModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowFilterSubjectModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Filter by Subject</Text>
                    <FlatList 
                        data={SUBJECTS}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { setFilterSubject(item.name); setShowFilterSubjectModal(false); }}>
                                <MaterialCommunityIcons name={item.icon} size={24} color="#002b5c" />
                                <Text style={styles.modalItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
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

  // --- LANDING PAGE STYLES ---
  landingScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  landingCard: {
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#eee'
  },
  schoolName: {
      color: '#002b5c',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10
  },
  landingTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'black',
      marginBottom: 15
  },
  userInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 15
  },
  userInfoItem: { flexDirection: 'row', alignItems: 'center' },
  userInfoText: { color: '#333', fontSize: 14, marginLeft: 5 },
  divider: { width: '100%', height: 1, backgroundColor: '#ddd', marginBottom: 20 },
  startExamTitle: {
      color: '#2e7d32', // Green
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20
  },
  letsStartBtn: {
      marginTop: 20,
      borderWidth: 1,
      borderColor: '#002b5c',
      borderRadius: 25,
      paddingVertical: 10,
      paddingHorizontal: 30,
      backgroundColor: 'white'
  },
  letsStartBtnText: { color: '#002b5c', fontWeight: 'bold' },

  // --- SHARED DROPDOWN / INPUT STYLES ---
  inputGroupFull: { width: '100%', marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: 'bold' },
  dropdownBox: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      borderWidth: 1, 
      borderColor: '#bbb', 
      borderRadius: 5, 
      padding: 12, 
      backgroundColor: 'white' 
  },
  dropdownText: { fontSize: 14, color: '#333' },

  // --- MODAL STYLES ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#002b5c', marginBottom: 15, textAlign: 'center' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16, color: '#333', marginLeft: 15 },

  // --- REPORT STYLES ---
  reportContainer: { flex: 1, backgroundColor: '#f5f7fa' },
  filterRow: { flexDirection: 'row', padding: 10, backgroundColor: 'white', elevation: 2, justifyContent: 'space-around' },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  filterBtnActive: { backgroundColor: '#002b5c', borderColor: '#002b5c' },
  filterText: { color: '#666', fontSize: 12 },
  filterTextActive: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  filterOptionsContainer: { backgroundColor: 'white', padding: 15, marginTop: 10, marginHorizontal: 15, borderRadius: 10, elevation: 2 },
  dateInputsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  dateInputGroup: { width: '48%' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-start', gap: 10 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  btnSearch: { backgroundColor: '#ff9800', flexDirection: 'row', gap: 5 }, 
  btnClear: { backgroundColor: '#007bff' }, 
  btnClose: { backgroundColor: '#dc3545' }, 
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  resultSummary: { padding: 15, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  summaryCount: { fontSize: 12, color: '#666' },
  reportList: { padding: 15 },
  reportCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  examDate: { fontSize: 12, color: '#888', marginTop: 2 },
  scoreBadge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6 },
  scoreText: { fontWeight: 'bold', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 15 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: '#555' },

  // DRAWER STYLES
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
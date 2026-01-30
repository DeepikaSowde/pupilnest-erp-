import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  ActivityIndicator, 
  Modal, 
  Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// --- INTERFACES ---
interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface ExamScreenProps {
  subject: string;
  subjectId: number; 
  classId: string;
  count: number;
  studentId: number; // <--- ADDED: Required by backend
  onFinish: () => void;
}

interface ResultData {
  success: boolean;
  score: number;
  total: number;
  message: string;
  percentage: number;
}

type AnswersState = Record<number, string>;

const ExamScreen: React.FC<ExamScreenProps> = ({ subject, subjectId, classId, count, studentId, onFinish }) => {
  
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswersState>({}); 
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 Minutes
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Result State
  const [showResult, setShowResult] = useState<boolean>(false);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  // 1. FETCH QUESTIONS
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const API_URL = 'https://pupilnest-erp.onrender.com/api/questions';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: subjectId, 
          classId: classId, 
          count: count 
        }),
      });

      const data = await response.json();
      
      if (data.success && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        Alert.alert("Notice", "No questions found for this subject.");
        onFinish();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load questions.");
      onFinish();
    } finally {
      setLoading(false);
    }
  };

  // 2. TIMER
  useEffect(() => {
    if (!loading && !showResult && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, showResult, questions]);

  // 3. SELECT OPTION
  const handleOptionSelect = (optionText: string) => {
    const currentQ = questions[currentIndex];
    setAnswers({ ...answers, [currentQ.id]: optionText });
  };

  // 4. SUBMIT EXAM (FIXED LOGIC)
  const submitExam = async () => {
    setSubmitting(true);

    // Calculate time taken string (e.g. "05:30")
    const timeTakenSeconds = 600 - timeLeft;
    const minutes = Math.floor(timeTakenSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeTakenSeconds % 60).toString().padStart(2, '0');
    const timeTakenFormatted = `${minutes}:${seconds}`;

    try {
      const API_URL = 'https://pupilnest-erp.onrender.com/api/submit-exam';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            answers: answers,
            studentId: studentId, // <--- SENDING ID
            subjectId: subjectId, // <--- SENDING SUBJECT ID
            classId: classId,     // <--- SENDING CLASS ID
            timeTaken: timeTakenFormatted // <--- SENDING TIME
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResultData(data);
        setShowResult(true);
      } else {
        Alert.alert("Error", "Submission failed. Server could not save result.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number): string => 
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#002b5c" />
        <Text style={{marginTop: 10, color: '#555'}}>Loading {subject} Exam...</Text>
      </View>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const optionKeys: (keyof Question)[] = ['option_a', 'option_b', 'option_c', 'option_d'];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#002b5c" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subjectText}>{subject} Test</Text>
          <Text style={styles.qCountText}>Question {currentIndex + 1} / {questions.length}</Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="white" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* QUESTION CARD */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.questionText}>{currentQ.question_text}</Text>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsContainer}>
          {optionKeys.map((key, idx) => {
            const optionText = currentQ[key] as string; 
            if (!optionText) return null;
            const isSelected = answers[currentQ.id] === optionText;

            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.optionBtn, isSelected && styles.optionSelected]} 
                onPress={() => handleOptionSelect(optionText)}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optText, isSelected && styles.optTextSelected]}>
                  {optionText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navBtn, {backgroundColor: '#b0bec5'}]} disabled={currentIndex === 0} onPress={() => setCurrentIndex(prev => prev - 1)}>
          <Text style={styles.btnText}>Previous</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity style={[styles.navBtn, {backgroundColor: '#2e7d32'}]} onPress={submitExam} disabled={submitting}>
            {submitting ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnText}>Submit Exam</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, {backgroundColor: '#002b5c'}]} onPress={() => setCurrentIndex(prev => prev + 1)}>
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* RESULT MODAL */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{resultData?.message}</Text>
            <View style={styles.circleContainer}>
              <View style={styles.circle}>
                <Text style={styles.scoreBig}>{Math.round(resultData?.percentage || 0)}</Text>
              </View>
            </View>
            <Text style={styles.resultLabel}>Your Result: {resultData?.score} Marks</Text>
            <Text style={styles.resultSub}>You scored {resultData?.score} out of {resultData?.total}</Text>
            <TouchableOpacity style={styles.closeResultBtn} onPress={onFinish}>
              <Text style={styles.closeResultText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#002b5c', elevation: 4 },
  subjectText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  qCountText: { color: '#ccc', fontSize: 12 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  timerText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  content: { padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 3, marginBottom: 20 },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#333', lineHeight: 26 },
  optionsContainer: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', elevation: 1 },
  optionSelected: { backgroundColor: '#e3f2fd', borderColor: '#002b5c' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#757575', marginRight: 15, justifyContent:'center', alignItems:'center' },
  radioSelected: { borderColor: '#002b5c' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#002b5c' },
  optText: { fontSize: 16, color: '#333', flex: 1 },
  optTextSelected: { color: '#002b5c', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', elevation: 10 },
  navBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  resultCard: { width: '85%', backgroundColor: '#ffe0b2', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 10 },
  resultTitle: { fontSize: 26, fontWeight: 'bold', color: '#bf360c', marginBottom: 20 },
  circleContainer: { marginBottom: 20 },
  circle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: '#ffcc80' },
  scoreBig: { fontSize: 40, fontWeight: 'bold', color: '#bf360c' },
  resultLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  resultSub: { fontSize: 15, color: '#555', marginBottom: 25 },
  tryAgainBtn: { backgroundColor: '#ffab91', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginBottom: 15, elevation: 2 },
  tryAgainText: { color: '#bf360c', fontWeight: 'bold', fontSize: 16 },
  closeResultBtn: { backgroundColor: '#d32f2f', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 8 },
  closeResultText: { color: 'white', fontWeight: 'bold' },
});

export default ExamScreen;
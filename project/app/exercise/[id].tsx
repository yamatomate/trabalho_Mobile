import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useExerciseContext } from '../../context/ExerciseContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { format } from '../../utils/dateFormatter';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercises, updateExercise } = useExerciseContext();
  const [exercise, setExercise] = useState<any>(null);
  const [newWeight, setNewWeight] = useState('');
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  useEffect(() => {
    if (id) {
      const foundExercise = exercises.find(ex => ex.id === id);
      if (foundExercise) {
        setExercise(foundExercise);
      } else {
        Alert.alert('Erro', 'Exercício não encontrado');
        router.back();
      }
    }
  }, [id, exercises]);

  const handleAddRecord = () => {
    if (!newWeight.trim()) {
      Alert.alert('Erro', 'O peso é obrigatório');
      return;
    }

    const weight = parseFloat(newWeight);
    
    if (isNaN(weight)) {
      Alert.alert('Erro', 'O peso deve ser um número válido');
      return;
    }

    const updatedExercise = {
      ...exercise,
      records: [
        ...(exercise.records || []),
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          weight
        }
      ]
    };

    updateExercise(updatedExercise);
    setExercise(updatedExercise);
    setNewWeight('');
    setIsAddingRecord(false);
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      "Excluir Registro",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: () => {
            const updatedExercise = {
              ...exercise,
              records: exercise.records.filter((record: any) => record.id !== recordId)
            };
            updateExercise(updatedExercise);
            setExercise(updatedExercise);
          },
          style: "destructive"
        }
      ]
    );
  };

  if (!exercise) {
    return (
      <View style={styles.centered}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{exercise.name}</Text>
      </View>

      {exercise.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Observações:</Text>
          <Text style={styles.notesText}>{exercise.notes}</Text>
        </View>
      ) : null}

      <View style={styles.recordsHeader}>
        <Text style={styles.recordsTitle}>Histórico de Pesos</Text>
        <TouchableOpacity 
          style={styles.addRecordButton}
          onPress={() => setIsAddingRecord(true)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addRecordButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {isAddingRecord && (
        <View style={styles.addRecordForm}>
          <TextInput
            style={styles.weightInput}
            value={newWeight}
            onChangeText={setNewWeight}
            placeholder="Peso (kg)"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.addRecordActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setIsAddingRecord(false);
                setNewWeight('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddRecord}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {exercise.records && exercise.records.length > 0 ? (
        <FlatList
          data={[...exercise.records].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.recordItem}>
              <View style={styles.recordInfo}>
                <Text style={styles.recordWeight}>{item.weight} kg</Text>
                <Text style={styles.recordDate}>{format(new Date(item.date))}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteRecord(item.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.recordsList}
        />
      ) : (
        <View style={styles.emptyRecords}>
          <Text style={styles.emptyRecordsText}>
            Nenhum registro de peso para este exercício.
          </Text>
          <Text style={styles.emptyRecordsSubText}>
            Adicione seu primeiro registro usando o botão acima.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addRecordButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  addRecordForm: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  weightInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  addRecordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  recordsList: {
    padding: 16,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordInfo: {
    flex: 1,
  },
  recordWeight: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
  },
  emptyRecords: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyRecordsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyRecordsSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useExerciseContext } from '../../context/ExerciseContext';
import { router } from 'expo-router';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExercisesScreen() {
  const { exercises, deleteExercise, loadExercises } = useExerciseContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadExercises();
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleDeleteExercise = (id: string) => {
    //A função Alert não funciona em web mas caso esteja demostrando tal funcionalidade no web adicione ao codigo antes do ALert "deleteExercise(id)"
    Alert.alert(
      "Excluir Exercício",
      "Tem certeza que deseja excluir este exercício? Todos os registros serão perdidos.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          onPress: () => deleteExercise(id),
          style: "destructive"
        }
      ]
    );
  };

  const navigateToExerciseDetail = (id: string) => {
    router.push(`/exercise/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Carregando exercícios...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Exercícios</Text>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum exercício cadastrado</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add')}
          >
            <Text style={styles.addButtonText}>Adicionar Exercício</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.exerciseCard}
              onPress={() => navigateToExerciseDetail(item.id)}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                {item.records && item.records.length > 0 ? (
                  <Text style={styles.lastRecord}>
                    Último: {item.records[item.records.length - 1].weight} kg
                  </Text>
                ) : (
                  <Text style={styles.noRecords}>Sem registros</Text>
                )}
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  onPress={() => handleDeleteExercise(item.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lastRecord: {
    fontSize: 14,
    color: '#4b5563',
  },
  noRecords: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
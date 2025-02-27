import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useExerciseContext } from '../../context/ExerciseContext';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExerciseScreen() {
  const [name, setName] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [notes, setNotes] = useState('');
  const { addExercise } = useExerciseContext();

  const handleAddExercise = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do exercício é obrigatório');
      return;
    }

    const weight = initialWeight ? parseFloat(initialWeight) : 0;
    
    if (isNaN(weight)) {
      Alert.alert('Erro', 'O peso deve ser um número válido');
      return;
    }

    const newExercise = {
      id: Date.now().toString(),
      name: name.trim(),
      notes: notes.trim(),
      records: initialWeight ? [
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          weight
        }
      ] : []
    };

    addExercise(newExercise);
    Alert.alert('Sucesso', 'Exercício adicionado com sucesso!', [
      { text: 'OK', onPress: () => router.push('/') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adicionar Exercício</Text>
      </View>

      <ScrollView style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do Exercício *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Supino Reto"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Peso Inicial (kg)</Text>
          <TextInput
            style={styles.input}
            value={initialWeight}
            onChangeText={setInitialWeight}
            placeholder="Ex: 60"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Observações sobre o exercício..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddExercise}
        >
          <Text style={styles.addButtonText}>Adicionar Exercício</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
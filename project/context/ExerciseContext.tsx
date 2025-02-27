import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Record {
  id: string;
  date: string;
  weight: number;
}

interface Exercise {
  id: string;
  name: string;
  notes?: string;
  records: Record[];
}

interface ExerciseContextType {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => Promise<void>;
  updateExercise: (exercise: Exercise) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  loadExercises: () => Promise<void>;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const useExerciseContext = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return context;
};

export const ExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const loadExercises = async () => {
    try {
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        setExercises(JSON.parse(storedExercises));
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const saveExercises = async (updatedExercises: Exercise[]) => {
    try {
      await AsyncStorage.setItem('exercises', JSON.stringify(updatedExercises));
    } catch (error) {
      console.error('Error saving exercises:', error);
    }
  };

  const addExercise = async (exercise: Exercise) => {
    const updatedExercises = [...exercises, exercise];
    setExercises(updatedExercises);
    await saveExercises(updatedExercises);
  };

  const updateExercise = async (updatedExercise: Exercise) => {
    const updatedExercises = exercises.map(exercise => 
      exercise.id === updatedExercise.id ? updatedExercise : exercise
    );
    setExercises(updatedExercises);
    await saveExercises(updatedExercises);
  };

  const deleteExercise = async (id: string) => {
    const updatedExercises = exercises.filter(exercise => exercise.id !== id);
    setExercises(updatedExercises);
    await saveExercises(updatedExercises);
  };

  return (
    <ExerciseContext.Provider value={{ 
      exercises, 
      addExercise, 
      updateExercise, 
      deleteExercise,
      loadExercises
    }}>
      {children}
    </ExerciseContext.Provider>
  );
};
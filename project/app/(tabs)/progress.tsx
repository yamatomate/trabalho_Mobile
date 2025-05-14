import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useExerciseContext } from '../../context/ExerciseContext';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryScatter } from 'victory-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from '../../utils/dateFormatter';

export default function ProgressScreen() {
  const { exercises } = useExerciseContext();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      // Select the first exercise with records by default
      const exerciseWithRecords = exercises.find(ex => ex.records && ex.records.length > 0);
      if (exerciseWithRecords) {
        setSelectedExercise(exerciseWithRecords.id);
      }
    }
  }, [exercises]);

  useEffect(() => {
    if (selectedExercise) {
      const exercise = exercises.find(ex => ex.id === selectedExercise);
      if (exercise && exercise.records && exercise.records.length > 0) {
        const data = exercise.records.map(record => ({
          x: new Date(record.date),
          y: record.weight,
          label: `${record.weight}kg (${format(new Date(record.date))})`
        }));
        setChartData(data);
      } else {
        setChartData([]);
      }
    }
  }, [selectedExercise, exercises]);

  const exercisesWithRecords = exercises.filter(ex => ex.records && ex.records.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progresso</Text>
      </View>

      {exercisesWithRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhum exercício com registros para mostrar.
          </Text>
          <Text style={styles.emptySubText}>
            Adicione exercícios e registre seus pesos para visualizar seu progresso.
          </Text>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.exerciseSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {exercisesWithRecords.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseButton,
                    selectedExercise === exercise.id && styles.exerciseButtonActive
                  ]}
                  onPress={() => setSelectedExercise(exercise.id)}
                >
                  <Text
                    style={[
                      styles.exerciseButtonText,
                      selectedExercise === exercise.id && styles.exerciseButtonTextActive
                    ]}
                  >
                    {exercise.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {chartData.length > 0 ? (
            <View style={styles.chartContainer}>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={20}
                width={350}
                height={300}
              >
                <VictoryAxis
                  tickFormat={(x) => format(new Date(x))}
                  style={{
                    tickLabels: { fontSize: 10, padding: 5, angle: -45 }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  // tickFormat={(y) => `${y}kg`} //nesse aqui o valor do Y que seria o peso fica com muitas casas apos a virgula ou ponto
                  tickFormat={(y) => `${parseFloat(y.toString().replace(',', '.')).toFixed(2).replace('.', ',')} kg`}  //limita a parte decimal apenas a 2 casas
                />
                <VictoryLine
                  data={chartData}
                  style={{
                    data: { stroke: "#6366f1", strokeWidth: 3 }
                  }}
                  /*
                  animate={{
                    duration: 500,
                    onLoad: { duration: 500 }
                  }}
                  */ //o grafico tende a não funcionar bem quando ativado 
                />
                <VictoryScatter
                  data={chartData}
                  size={7}
                  style={{
                    data: { fill: "#6366f1" }
                  }}
                  labels={({ datum }) => datum.label}
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{
                        stroke: "#e5e7eb",
                        fill: "white"
                      }}
                    />
                  }
                />
              </VictoryChart>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Sem dados suficientes para mostrar o gráfico.
              </Text>
            </View>
          )}

          {selectedExercise && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Estatísticas</Text>
              
              {(() => {
                const exercise = exercises.find(ex => ex.id === selectedExercise);
                if (!exercise || !exercise.records || exercise.records.length === 0) {
                  return <Text style={styles.noStatsText}>Sem dados disponíveis</Text>;
                }
                
                const weights = exercise.records.map(r => r.weight);
                const initialWeight = weights[0];
                const currentWeight = weights[weights.length - 1];
                const maxWeight = Math.max(...weights);
                const progress = currentWeight - initialWeight;
                const progressPercentage = ((progress / initialWeight) * 100).toFixed(1);
                
                return (
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{initialWeight} kg</Text>
                      <Text style={styles.statLabel}>Peso Inicial</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{currentWeight} kg</Text>
                      <Text style={styles.statLabel}>Peso Atual</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{maxWeight} kg</Text>
                      <Text style={styles.statLabel}>Peso Máximo</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[
                        styles.statValue, 
                        progress > 0 ? styles.positiveProgress : progress < 0 ? styles.negativeProgress : {}
                      ]}>
                        {progress > 0 ? '+' : ''}{progress} kg ({progressPercentage}%)
                      </Text>
                      <Text style={styles.statLabel}>Progresso</Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          )}
        </ScrollView>
      )}
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
  exerciseSelector: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exerciseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
  },
  exerciseButtonActive: {
    backgroundColor: '#6366f1',
  },
  exerciseButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  exerciseButtonTextActive: {
    color: '#ffffff',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  positiveProgress: {
    color: '#10b981',
  },
  negativeProgress: {
    color: '#ef4444',
  },
  noStatsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
});
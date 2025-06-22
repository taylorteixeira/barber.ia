import { View, Text, StyleSheet } from 'react-native';

export default function BarberDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard do Barbeiro</Text>
      <Text>Funcionando!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

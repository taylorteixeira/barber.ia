import { View, Text, SafeAreaView } from 'react-native';
import { styles } from './index-styles';

export default function BarberDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard do Barbeiro</Text>
        <Text style={styles.subtitle}>Bem-vindo ao portal do barbeiro!</Text>
      </View>
    </SafeAreaView>
  );
}

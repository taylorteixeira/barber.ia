import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { MapPin, Search, Star, Navigation, Filter } from 'lucide-react-native';
import * as Location from 'expo-location';

type Barber = {
  id: string;
  name: string;
  rating: number;
  distance: number;
  price: number;
  image: string;
  reviews: number;
  location: {
    latitude: number;
    longitude: number;
  };
};

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nearbyBarbers, setNearbyBarbers] = useState<Barber[]>([]);
  const router = useRouter();

  const categories = [
    { id: 'corte', name: 'Corte', icon: '✂️' },
    { id: 'barba', name: 'Barba', icon: '🧔' },
    { id: 'sobrancelha', name: 'Sobrancelha', icon: '👁️' },
    { id: 'pacotes', name: 'Pacotes', icon: '💼' },
    { id: 'promocoes', name: 'Promoções', icon: '🔥' },
  ];

  // Mock data for nearby barbers
  const mockBarbers: Barber[] = [
    {
      id: '1',
      name: 'Barbearia Premium',
      rating: 4.8,
      distance: 0.5,
      price: 35,
      image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
      reviews: 124,
      location: { latitude: -23.5505, longitude: -46.6333 },
    },
    {
      id: '2',
      name: 'Cortes Modernos',
      rating: 4.6,
      distance: 1.2,
      price: 28,
      image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
      reviews: 89,
      location: { latitude: -23.5515, longitude: -46.6343 },
    },
    {
      id: '3',
      name: 'Studio do Barbeiro',
      rating: 4.9,
      distance: 0.8,
      price: 42,
      image: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
      reviews: 156,
      location: { latitude: -23.5495, longitude: -46.6323 },
    },
  ];

  useEffect(() => {
    setNearbyBarbers(mockBarbers);
  }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à localização');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      Alert.alert('Localização obtida', 'Barbeiros próximos atualizados!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const handleBarberPress = (barberId: string) => {
    router.push(`/barber/${barberId}`);
  };

  const renderBarberCard = (barber: Barber) => (
    <TouchableOpacity
      key={barber.id}
      style={styles.barberCard}
      onPress={() => handleBarberPress(barber.id)}
    >
      <Image source={{ uri: barber.image }} style={styles.barberImage} />
      <View style={styles.barberInfo}>
        <Text style={styles.barberName}>{barber.name}</Text>
        <View style={styles.barberStats}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{barber.rating}</Text>
            <Text style={styles.reviewsText}>({barber.reviews})</Text>
          </View>
          <Text style={styles.distanceText}>{barber.distance}km</Text>
        </View>
        <Text style={styles.priceText}>A partir de R$ {barber.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Encontre seu barbeiro</Text>
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
          <Navigation size={20} color="#2563EB" />
          <Text style={styles.locationButtonText}>
            {location ? 'Localização obtida' : 'Usar minha localização'}
          </Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar barbeiro, serviço ou localização"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                }
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.barbersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Barbeiros próximos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.barbersList}>
            {nearbyBarbers.map(renderBarberCard)}
          </View>
        </View>

        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Mapa de barbeiros</Text>
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#6B7280" />
            <Text style={styles.mapPlaceholderText}>Mapa interativo em breve</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingLeft: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  barbersContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  barbersList: {
    paddingHorizontal: 24,
  },
  barberCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  barberImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  barberInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  barberName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  barberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 2,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  mapContainer: {
    marginBottom: 32,
  },
  mapPlaceholder: {
    marginHorizontal: 24,
    height: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
  },
});
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
import { Search, Star, Navigation, Filter } from 'lucide-react-native';
import * as Location from 'expo-location';
import { getBarbers, initBarbersDatabase, Barber } from '@/services/database';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [nearbyBarbers, setNearbyBarbers] = useState<Barber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]);
  const router = useRouter();

  const categories = [
    { id: 'corte', name: 'Corte', icon: '✂️' },
    { id: 'barba', name: 'Barba', icon: '🧔' },
    { id: 'sobrancelha', name: 'Sobrancelha', icon: '👁️' },
    { id: 'pacotes', name: 'Pacotes', icon: '💼' },
    { id: 'promocoes', name: 'Promoções', icon: '🔥' },
  ];

  useEffect(() => {
    const loadBarbers = async () => {
      await initBarbersDatabase();
      try {
        const data = await getBarbers();
        setNearbyBarbers(data);
        setFilteredBarbers(data);
      } catch (err) {
        console.error('Failed to load barbers:', err);
      }
    };
    loadBarbers();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredBarbers(nearbyBarbers);
    } else {
      const filtered = nearbyBarbers.filter((barber) => {
        switch (selectedCategory) {
          case 'corte':
            return barber.price <= 35;
          case 'barba':
            return barber.rating >= 4.7;
          case 'sobrancelha':
            return barber.price >= 30;
          case 'pacotes':
            return barber.price >= 40;
          case 'promocoes':
            return barber.price <= 30;
          default:
            return true;
        }
      });
      setFilteredBarbers(filtered);
    }
  }, [selectedCategory, nearbyBarbers]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'É necessário permitir acesso à localização'
        );
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
    router.push({ pathname: '/barber/[id]', params: { id: barberId } });
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Encontre seu barbeiro</Text>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={requestLocation}
        >
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id &&
                    styles.categoryChipSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                      styles.categoryTextSelected,
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
            <Text style={styles.sectionTitle}>
              {selectedCategory
                ? `Categoria: ${
                    categories.find((c) => c.id === selectedCategory)?.name
                  }`
                : 'Barbeiros próximos'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.barbersList}>
            {filteredBarbers.map(renderBarberCard)}
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barberImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  barberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
});

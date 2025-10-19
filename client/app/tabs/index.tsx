import {
  View,
  Text,
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
import { styles } from './index-styles';

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

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Search,
  Filter,
  MapPin,
  Star,
  SlidersHorizontal,
} from 'lucide-react-native';
import { getBarbers } from '@/services/database';
import { styles } from './search-styles';

type Barber = {
  id: string;
  name: string;
  rating: number;
  distance: number;
  price: number;
  image: string;
  reviews: number;
  specialties?: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  isRegisteredBarbershop?: boolean;
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const barbers = await getBarbers();
      setSearchResults(barbers);
    } catch (error) {
      console.error('Error loading barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    {
      id: 'distance',
      name: 'Distância',
      options: ['< 1km', '1-3km', '3-5km', '> 5km'],
    },
    {
      id: 'price',
      name: 'Preço',
      options: ['R$ 20-30', 'R$ 30-40', 'R$ 40-50', '> R$ 50'],
    },
    {
      id: 'rating',
      name: 'Avaliação',
      options: ['4+ estrelas', '4.5+ estrelas', '4.8+ estrelas'],
    },
    {
      id: 'services',
      name: 'Serviços',
      options: ['Corte', 'Barba', 'Sobrancelha', 'Pacotes'],
    },
  ];
  const filteredResults = searchResults.filter((barber) =>
    barber.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleBarberPress = (barberId: string) => {
    router.push(`/barbershop/${barberId}` as any);
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
          <View style={styles.distanceContainer}>
            <MapPin size={12} color="#6B7280" />
            <Text style={styles.distanceText}>{barber.distance}km</Text>
          </View>
        </View>
        <View style={styles.specialtiesContainer}>
          {(barber.specialties || []).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.priceText}>A partir de R$ {barber.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar Barbeiros</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar barbeiro, serviço..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showFilters && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal
            size={20}
            color={showFilters ? '#FFFFFF' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {filters.map((filter) => (
              <View key={filter.id} style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>{filter.name}</Text>
                {filter.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterOption,
                      selectedFilters.includes(option) &&
                        styles.filterOptionSelected,
                    ]}
                    onPress={() => {
                      if (selectedFilters.includes(option)) {
                        setSelectedFilters(
                          selectedFilters.filter((f) => f !== option)
                        );
                      } else {
                        setSelectedFilters([...selectedFilters, option]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilters.includes(option) &&
                          styles.filterOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredResults.length} barbeiros encontrados
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Ordenar</Text>
          <Filter size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Carregando barbearias...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredResults.map(renderBarberCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

import {
  View,
  Text,
  StyleSheet,
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
        </View>{' '}
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
      )}{' '}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
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
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingLeft: 24,
  },
  filterGroup: {
    marginRight: 20,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginRight: 4,
  },
  resultsList: {
    flex: 1,
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
    marginBottom: 6,
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 2,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specialtyTag: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 12,
  },
});

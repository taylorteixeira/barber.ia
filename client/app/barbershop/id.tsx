import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Calendar,
  Scissors,
  DollarSign,
  Heart,
  Share2,
  Camera,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './id-styles';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    price: 25,
    duration: 30,
    description: 'Corte moderno e estiloso',
  },
  {
    id: '2',
    name: 'Barba Completa',
    price: 15,
    duration: 20,
    description: 'Aparar, modelar e finalizar',
  },
  {
    id: '3',
    name: 'Corte + Barba',
    price: 35,
    duration: 45,
    description: 'Pacote completo premium',
  },
  {
    id: '4',
    name: 'Sobrancelha',
    price: 10,
    duration: 15,
    description: 'Design e modelagem',
  },
];

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pomada Modeladora',
    price: 25,
    image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg',
    description: 'Fixação forte, brilho natural',
  },
  {
    id: '2',
    name: 'Óleo para Barba',
    price: 30,
    image: 'https://images.pexels.com/photos/4623103/pexels-photo-4623103.jpeg',
    description: 'Hidratação e maciez',
  },
  {
    id: '3',
    name: 'Shampoo Premium',
    price: 35,
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg',
    description: 'Limpeza profunda',
  },
];

const REVIEWS: Review[] = [
  {
    id: '1',
    clientName: 'João Silva',
    rating: 5,
    comment: 'Excelente trabalho! Barbeiro muito profissional e ambiente top.',
    date: '2024-06-20',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  },
  {
    id: '2',
    clientName: 'Pedro Santos',
    rating: 5,
    comment:
      'Melhor barbearia da região. Corte perfeito e atendimento nota 10!',
    date: '2024-06-18',
    avatar:
      'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg',
  },
  {
    id: '3',
    clientName: 'Carlos Lima',
    rating: 4,
    comment: 'Muito bom! Ambiente moderno e barbeiros experientes.',
    date: '2024-06-15',
    avatar:
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
  },
];

export default function BarbershopDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const barberId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    'services' | 'products' | 'reviews'
  >('services');
  const [isFavorite, setIsFavorite] = useState(false);

  const barbershop = {
    id: barberId || '1',
    name: 'Barbearia Premium',
    rating: 4.8,
    reviewCount: 124,
    distance: '0.5 km',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-9999',
    hours: 'Seg-Sex: 8h-18h | Sáb: 8h-16h',
    image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
    gallery: [
      'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
      'https://images.pexels.com/photos/2040625/pexels-photo-2040625.jpeg',
      'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
    ],
    description:
      'Barbearia moderna com profissionais experientes, oferecendo os melhores serviços de corte e cuidados masculinos na região.',
  };

  const handleBookAppointment = () => {
    router.push(`/booking?id=${barberId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? '#F59E0B' : '#E5E7EB'}
        fill={i < rating ? '#F59E0B' : 'transparent'}
      />
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return (
          <View style={styles.tabContent}>
            {SERVICES.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceIcon}>
                  <Scissors size={20} color="#059669" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                  <View style={styles.serviceDetails}>
                    <View style={styles.serviceDetail}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.serviceDetailText}>
                        {service.duration}min
                      </Text>
                    </View>
                    <View style={styles.servicePrice}>
                      <DollarSign size={16} color="#059669" />
                      <Text style={styles.servicePriceText}>
                        R$ {service.price}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 'products':
        return (
          <View style={styles.tabContent}>
            <View style={styles.productsGrid}>
              {PRODUCTS.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDescription}>
                      {product.description}
                    </Text>
                    <View style={styles.productPrice}>
                      <Text style={styles.productPriceText}>
                        R$ {product.price}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            {REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{ uri: review.avatar }}
                    style={styles.reviewAvatar}
                  />
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewerName}>{review.clientName}</Text>
                    <View style={styles.reviewRating}>
                      {renderStars(review.rating)}
                      <Text style={styles.reviewDate}>
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              size={24}
              color={isFavorite ? '#EF4444' : '#6B7280'}
              fill={isFavorite ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: barbershop.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.galleryButton}>
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.galleryText}>Ver fotos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.barbershopName}>{barbershop.name}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              {renderStars(Math.floor(barbershop.rating))}
              <Text style={styles.ratingText}>{barbershop.rating}</Text>
              <Text style={styles.reviewCount}>
                ({barbershop.reviewCount} avaliações)
              </Text>
            </View>
            <View style={styles.distance}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.distanceText}>{barbershop.distance}</Text>
            </View>
          </View>

          <Text style={styles.description}>{barbershop.description}</Text>

          <View style={styles.contactSection}>
            <View style={styles.contactItem}>
              <MapPin size={18} color="#059669" />
              <Text style={styles.contactText}>{barbershop.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={18} color="#059669" />
              <Text style={styles.contactText}>{barbershop.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Clock size={18} color="#059669" />
              <Text style={styles.contactText}>{barbershop.hours}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'services' && styles.activeTabText,
              ]}
            >
              Serviços
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'products' && styles.activeTabText,
              ]}
            >
              Produtos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.activeTabText,
              ]}
            >
              Avaliações
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bookingContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.bookButtonGradient}
          >
            <Calendar size={24} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Agendar Horário</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

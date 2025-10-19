import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  getBarbers,
  Barber,
  getBarbershopById,
  Barbershop,
} from '@/services/database';
import {
  Calendar,
  Clock,
  Star,
  MapPin,
  Phone,
  User,
} from 'lucide-react-native';

export default function BarberProfile() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  useEffect(() => {
    const load = async () => {
      const all = await getBarbers();
      const found = all.find((b) => b.id === id);
      setBarber(found || null);

      if (found) {
        if (id?.startsWith('real_')) {
          const realBarbershopId = parseInt(id.replace('real_', ''));
          const barbershopDetails = await getBarbershopById(realBarbershopId);
          setBarbershop(barbershopDetails);
        } else if (!isNaN(Number(id))) {
          const barbershopDetails = await getBarbershopById(Number(id));
          setBarbershop(barbershopDetails);
        }
      }
    };
    load();
  }, [id]);

  if (!barber) {
    return (
      <View style={styles.center}>
        <Text>Carregando barbeiro...</Text>
      </View>
    );
  }
  const handleBook = () => {
    router.push({
      pathname: '/booking',
      params: { id: id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: barber.image }} style={styles.heroImage} />
          <View style={styles.overlay}>
            <Text style={styles.heroName}>{barber.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{barber.rating}</Text>
              <Text style={styles.reviewsText}>
                ({barber.reviews} avaliações)
              </Text>
            </View>
          </View>
        </View>
        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <MapPin size={24} color="#2563EB" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Localização</Text>
              <Text style={styles.infoText}>
                {barbershop
                  ? barbershop.address
                  : `${barber.distance}km de distância`}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Clock size={24} color="#10B981" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Horário</Text>
              <Text style={styles.infoText}>
                {barbershop &&
                barbershop.workingHours &&
                barbershop.workingHours.monday
                  ? `${barbershop.workingHours.monday.openTime} às ${barbershop.workingHours.monday.closeTime}`
                  : 'Seg-Sáb: 8h às 18h'}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Phone size={24} color="#F59E0B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Contato</Text>
              <Text style={styles.infoText}>
                {barbershop ? barbershop.phone : '(11) 99999-9999'}
              </Text>
            </View>
          </View>
        </View>
        {/* Additional Barbershop Info */}
        {barbershop && barbershop.description && (
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Sobre a Barbearia</Text>
            <Text style={styles.aboutText}>{barbershop.description}</Text>
          </View>
        )}
        {/* Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
          <View style={styles.servicesList}>
            {barbershop &&
            barbershop.services &&
            barbershop.services.length > 0 ? (
              barbershop.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>R$ {service.price}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceName}>Corte de Cabelo</Text>
                  <Text style={styles.servicePrice}>R$ {barber.price}</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceName}>Barba</Text>
                  <Text style={styles.servicePrice}>
                    R$ {Math.round(barber.price * 0.8)}
                  </Text>
                </View>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceName}>Corte + Barba</Text>
                  <Text style={styles.servicePrice}>
                    R$ {Math.round(barber.price * 1.4)}
                  </Text>
                </View>
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceName}>Sobrancelha</Text>
                  <Text style={styles.servicePrice}>
                    R$ {Math.round(barber.price * 0.5)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.aboutText}>
            Barbearia especializada em cortes modernos e clássicos. Mais de{' '}
            {barber.reviews} clientes satisfeitos com nosso atendimento premium.
            Ambiente acolhedor e profissionais experientes.
          </Text>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bookingContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>A partir de</Text>
          <Text style={styles.priceValue}>R$ {barber.price}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Calendar size={20} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Agendar Horário</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  heroName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  reviewsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E5E7EB',
    marginLeft: 8,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  servicesList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  servicePrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  bookingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});

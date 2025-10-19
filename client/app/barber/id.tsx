import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
} from 'lucide-react-native';

import { styles } from './id-styles';

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
        {barbershop && barbershop.description && (
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Sobre a Barbearia</Text>
            <Text style={styles.aboutText}>{barbershop.description}</Text>
          </View>
        )}
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
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.aboutText}>
            Barbearia especializada em cortes modernos e clássicos. Mais de
            {barber.reviews} clientes satisfeitos com nosso atendimento premium.
            Ambiente acolhedor e profissionais experientes.
          </Text>
        </View>
      </ScrollView>

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

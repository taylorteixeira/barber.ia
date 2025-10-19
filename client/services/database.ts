import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs';

if (typeof bcrypt.setRandomFallback === 'function') {
  bcrypt.setRandomFallback((len: number) => {
    const buf = Array.from({ length: len }, () =>
      Math.floor(Math.random() * 256)
    );
    return buf;
  });
}
export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  userType: 'client' | 'barber';
  barbershopId?: number;
}
export interface Barbershop {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  workingHours: WorkingHours;
  ownerId: number;
  services: Service[];
  createdAt: string;
}
export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}
export interface BarberProfile {
  id: number;
  userId: number;
  barbershopId: number;
  specialties: string[];
  workingDays: string[];
  customWorkingHours?: Partial<WorkingHours>;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  joinedAt: string;
}
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  barbershopId?: number;
  isActive: boolean;
  createdAt?: string;
}

const USERS_STORAGE_KEY = 'barber_users';
const CURRENT_USER_KEY = 'barber_current_user';
const USER_COUNTER_KEY = 'barber_user_counter';
const BARBERSHOPS_STORAGE_KEY = 'barbershops';
const BARBER_PROFILES_STORAGE_KEY = 'barber_profiles';
const BARBERSHOP_COUNTER_KEY = 'barbershop_counter';
const BARBER_PROFILE_COUNTER_KEY = 'barber_profile_counter';

export const initDatabase = async (): Promise<void> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    if (!usersJson) {
      await SecureStore.setItemAsync(USERS_STORAGE_KEY, JSON.stringify([]));
      await SecureStore.setItemAsync(USER_COUNTER_KEY, '1');
    }

    const barbershopsJson = await SecureStore.getItemAsync(
      BARBERSHOPS_STORAGE_KEY
    );
    if (!barbershopsJson) {
      await SecureStore.setItemAsync(
        BARBERSHOPS_STORAGE_KEY,
        JSON.stringify([])
      );
      await SecureStore.setItemAsync(BARBERSHOP_COUNTER_KEY, '1');
    }

    const barberProfilesJson = await SecureStore.getItemAsync(
      BARBER_PROFILES_STORAGE_KEY
    );
    if (!barberProfilesJson) {
      await SecureStore.setItemAsync(
        BARBER_PROFILES_STORAGE_KEY,
        JSON.stringify([])
      );
      await SecureStore.setItemAsync(BARBER_PROFILE_COUNTER_KEY, '1');
    }

    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const registerUser = async (user: User): Promise<boolean> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    if (!usersJson) {
      await initDatabase();
    }

    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    const emailExists = users.some((u) => u.email === user.email);
    if (emailExists) {
      return false;
    }

    const counterStr =
      (await SecureStore.getItemAsync(USER_COUNTER_KEY)) || '1';
    const counter = parseInt(counterStr, 10);
    if (!user.password) {
      console.error('Password is required for user registration');
      return false;
    }

    let hashedPassword: string;
    try {
      const saltRounds = 10;
      console.log('bcrypt saltRounds type:', typeof saltRounds, saltRounds);
      hashedPassword = bcrypt.hashSync(user.password, saltRounds);
    } catch (err) {
      console.error('Bcrypt hash error:', err);
      return false;
    }
    const newUser: User = {
      id: counter,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: hashedPassword,
      userType: user.userType,
    };

    users.push(newUser);

    await SecureStore.setItemAsync(USERS_STORAGE_KEY, JSON.stringify(users));

    await SecureStore.setItemAsync(USER_COUNTER_KEY, (counter + 1).toString());

    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

export const registerAndLoginUser = async (
  user: Omit<User, 'id'>
): Promise<User | null> => {
  try {
    if (!user.password) {
      console.error('Password is required for registration');
      return null;
    }

    const registerSuccess = await registerUser(user);

    if (!registerSuccess) {
      return null;
    }

    const loggedInUser = await loginUser(user.email, user.password);
    return loggedInUser;
  } catch (error) {
    console.error('Error registering and logging in user:', error);
    return null;
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    if (!usersJson) {
      return null;
    }

    const users: User[] = JSON.parse(usersJson);
    const user = users.find((u) => u.email === email);

    if (!user) {
      return null;
    }

    if (!user.password) {
      console.error('User password not found');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
      };

      await SecureStore.setItemAsync(
        CURRENT_USER_KEY,
        JSON.stringify(userSession)
      );
      return user;
    }

    return null;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
};

export const checkUserSession = async (): Promise<boolean> => {
  try {
    const user = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    return !!user;
  } catch (error) {
    console.error('Error checking user session:', error);
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

export const getCurrentUserFromSecureStore = async (): Promise<any | null> => {
  try {
    const userJson = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateUser = async (user: User): Promise<boolean> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      const updatedUser = { ...users[index], ...user };

      if (user.password && user.password !== users[index].password) {
        try {
          const saltRounds = 10;
          updatedUser.password = bcrypt.hashSync(user.password, saltRounds);
        } catch (err) {
          console.error('Bcrypt hash error:', err);
          return false;
        }
      }

      users[index] = updatedUser;
      await SecureStore.setItemAsync(USERS_STORAGE_KEY, JSON.stringify(users));
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id === user.id) {
        const sessionUser = { ...updatedUser };
        if (sessionUser.password) {
          delete sessionUser.password;
        }
        await SecureStore.setItemAsync(
          CURRENT_USER_KEY,
          JSON.stringify(sessionUser)
        );
        await AsyncStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(sessionUser)
        );
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    return users.find((u) => u.id === userId) || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

export const checkEmailExistsForUpdate = async (
  email: string,
  currentUserId: number
): Promise<boolean> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    const existingUser = users.find(
      (u) => u.email === email && u.id !== currentUserId
    );
    return !!existingUser;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
};
export interface Barber {
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
  specialties?: string[];
  isRegisteredBarbershop?: boolean;
}
const BARBERS_STORAGE_KEY = 'barber_barbers';

export const initBarbersDatabase = async (): Promise<void> => {
  const data = await AsyncStorage.getItem(BARBERS_STORAGE_KEY);
  let barbers: Barber[] = [];
  if (data) {
    try {
      barbers = JSON.parse(data);
    } catch {
      barbers = [];
    }
  }
  if (!data || barbers.length === 0) {
    const exampleBarbers: Barber[] = [
      {
        id: 'mock_1',
        name: 'Barbearia Premium',
        rating: 4.8,
        distance: 0.5,
        price: 35,
        image:
          'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
        reviews: 124,
        location: { latitude: -23.5505, longitude: -46.6333 },
        specialties: ['Corte', 'Barba'],
        isRegisteredBarbershop: false,
      },
      {
        id: 'mock_2',
        name: 'Cortes Modernos',
        rating: 4.6,
        distance: 1.2,
        price: 28,
        image:
          'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
        reviews: 89,
        location: { latitude: -23.5515, longitude: -46.6343 },
        specialties: ['Corte', 'Sobrancelha'],
        isRegisteredBarbershop: false,
      },
      {
        id: 'mock_3',
        name: 'Studio do Barbeiro',
        rating: 4.9,
        distance: 0.8,
        price: 42,
        image:
          'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
        reviews: 156,
        location: { latitude: -23.5495, longitude: -46.6323 },
        specialties: ['Corte', 'Barba', 'Pacotes'],
        isRegisteredBarbershop: false,
      },
    ];
    await AsyncStorage.setItem(
      BARBERS_STORAGE_KEY,
      JSON.stringify(exampleBarbers)
    );
  }
};

export const getBarbers = async (): Promise<Barber[]> => {
  await initBarbersDatabase();

  const mockJson = await AsyncStorage.getItem(BARBERS_STORAGE_KEY);
  const mockBarbers: Barber[] = mockJson ? JSON.parse(mockJson) : [];

  const realBarbershops = await getAllBarbershops();
  const realBarbers: Barber[] = realBarbershops.map((barbershop) => ({
    id: `real_${barbershop.id}`,
    name: barbershop.name,
    rating: 4.5,
    distance: Math.random() * 2,
    price:
      barbershop.services && barbershop.services.length > 0
        ? Math.min(...barbershop.services.map((s) => s.price))
        : 30,
    image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
    reviews: Math.floor(Math.random() * 100) + 10,
    location: {
      latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
      longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
    },
    specialties: barbershop.services
      ? barbershop.services.map((s) => s.category)
      : ['Corte', 'Barba'],
    isRegisteredBarbershop: true,
  }));

  const allBarbers = [...mockBarbers, ...realBarbers];
  return allBarbers;
};

export const getRefreshedBarbers = async (): Promise<Barber[]> => {
  await initBarbersDatabase();
  return await getBarbers();
};

export const updateMockBarbersWithRealisticData = async (): Promise<void> => {
  const mockBarbers: Barber[] = [
    {
      id: 'mock_1',
      name: 'Barbearia Premium',
      rating: 4.8,
      distance: 0.5,
      price: 35,
      image:
        'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
      reviews: 124,
      location: { latitude: -23.5505, longitude: -46.6333 },
      specialties: ['Corte', 'Barba', 'Sobrancelha'],
      isRegisteredBarbershop: false,
    },
    {
      id: 'mock_2',
      name: 'Cortes Modernos',
      rating: 4.6,
      distance: 1.2,
      price: 28,
      image:
        'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
      reviews: 89,
      location: { latitude: -23.5515, longitude: -46.6343 },
      specialties: ['Corte', 'Barba'],
      isRegisteredBarbershop: false,
    },
    {
      id: 'mock_3',
      name: 'Studio do Barbeiro',
      rating: 4.9,
      distance: 0.8,
      price: 42,
      image:
        'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
      reviews: 156,
      location: { latitude: -23.5495, longitude: -46.6323 },
      specialties: ['Corte', 'Barba', 'Sobrancelha', 'Pacotes'],
      isRegisteredBarbershop: false,
    },
  ];

  await AsyncStorage.setItem(BARBERS_STORAGE_KEY, JSON.stringify(mockBarbers));
};

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
export interface Booking {
  id: string;
  userId?: number;
  barbershopId?: number;
  barberName: string;
  barberImage: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  address: string;
  phone: string;
  clientName?: string;
  clientEmail?: string;
}
const BOOKINGS_STORAGE_KEY = 'barber_bookings';

export const initBookingsDatabase = async (): Promise<void> => {
  const data = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (!data) {
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([]));
  }
};

export const getBookings = async (): Promise<Booking[]> => {
  await initBookingsDatabase();
  const json = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const getBookingsByUserId = async (
  userId: number
): Promise<Booking[]> => {
  try {
    const allBookings = await getBookings();
    return allBookings.filter((booking) => booking.userId === userId);
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

export const getBookingsByBarbershopId = async (
  barbershopId: number
): Promise<Booking[]> => {
  try {
    const allBookings = await getBookings();
    return allBookings.filter(
      (booking) => booking.barbershopId === barbershopId
    );
  } catch (error) {
    console.error('Error getting barbershop bookings:', error);
    return [];
  }
};

export const getAppointmentsForCurrentBarber = async (): Promise<
  Appointment[]
> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.userType !== 'barber') {
      return [];
    }

    const barbershop = await getBarbershopByOwnerId(currentUser.id!);
    if (!barbershop) {
      return [];
    }
    const barbershopBookings = await getBookingsByBarbershopId(barbershop.id);

    const bookingAppointments: Appointment[] = barbershopBookings.map(
      (booking) => ({
        id: `booking_${booking.id}`,
        clientId: booking.userId?.toString() || booking.id,
        serviceId: `service_${booking.service
          .replace(/\s+/g, '_')
          .toLowerCase()}`,
        date: booking.date,
        time: booking.time,
        status: booking.status === 'confirmed' ? 'confirmed' : 'scheduled',
        notes: `Cliente: ${booking.clientName || 'Cliente'} (${
          booking.phone
        }) - Serviço: ${booking.service} - Valor: R$ ${booking.price}`,
        createdAt: new Date().toISOString(),
      })
    );

    return bookingAppointments;
  } catch (error) {
    console.error('Error getting barber appointments:', error);
    return [];
  }
};

export const updateBooking = async (updatedBooking: Booking): Promise<void> => {
  const bookings = await getBookings();
  const newList = bookings.map((b) =>
    b.id === updatedBooking.id ? updatedBooking : b
  );
  await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(newList));
};

export const createBooking = async (newBooking: Booking): Promise<void> => {
  const bookings = await getBookings();

  const currentUser = await getCurrentUser();
  if (currentUser) {
    newBooking.userId = currentUser.id;
    newBooking.clientName = currentUser.name;
    newBooking.clientEmail = currentUser.email;
    newBooking.phone = currentUser.phone;
  }

  bookings.push(newBooking);
  await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

  await syncBookingToAppointment(newBooking);

  if (newBooking.clientName && newBooking.phone) {
    await createOrUpdateClientFromBooking(newBooking);
  }
};

export const syncBookingToAppointment = async (
  booking: Booking
): Promise<void> => {
  try {
    const appointment: Omit<Appointment, 'id' | 'createdAt'> = {
      clientId: booking.userId?.toString() || booking.id,
      serviceId: 'service_' + Date.now(),
      date: booking.date,
      time: booking.time,
      status: booking.status === 'confirmed' ? 'confirmed' : 'scheduled',
      notes: `Cliente: ${booking.clientName || 'Cliente'} (${
        booking.phone
      }) - Serviço: ${booking.service} - Valor: R$ ${booking.price}${
        booking.clientEmail ? ` - Email: ${booking.clientEmail}` : ''
      }`,
    };

    await createAppointment(appointment);
  } catch (error) {
    console.error('Error syncing booking to appointment:', error);
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  newStatus: BookingStatus,
  updatedBy: 'client' | 'barber' = 'client'
): Promise<boolean> => {
  try {
    const bookings = await getBookings();
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

    if (bookingIndex === -1) return false;

    bookings[bookingIndex].status = newStatus;
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

    const appointments = await getAppointments();
    const appointmentIndex = appointments.findIndex(
      (a) =>
        a.id === `booking_${bookingId}` ||
        (a.notes && a.notes.includes(bookings[bookingIndex].clientName || ''))
    );

    if (appointmentIndex !== -1) {
      let appointmentStatus:
        | 'scheduled'
        | 'confirmed'
        | 'completed'
        | 'cancelled';
      switch (newStatus) {
        case 'confirmed':
          appointmentStatus = 'confirmed';
          break;
        case 'completed':
          appointmentStatus = 'completed';
          break;
        case 'cancelled':
          appointmentStatus = 'cancelled';
          break;
        default:
          appointmentStatus = 'scheduled';
      }

      appointments[appointmentIndex].status = appointmentStatus;
      await AsyncStorage.setItem(
        APPOINTMENTS_STORAGE_KEY,
        JSON.stringify(appointments)
      );
    }

    console.log(
      `Booking ${bookingId} status updated to ${newStatus} by ${updatedBy}`
    );
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
};

export const createOrUpdateClientFromBooking = async (
  booking: Booking
): Promise<void> => {
  try {
    if (!booking.clientName || !booking.phone) return;

    const clients = await getClients();
    const existingClient = clients.find(
      (c) =>
        c.phone === booking.phone ||
        (booking.clientEmail && c.email === booking.clientEmail)
    );

    if (existingClient) {
      const updatedClient = {
        ...existingClient,
        name: booking.clientName,
        phone: booking.phone,
        email: booking.clientEmail || existingClient.email,
      };
      await updateClient(updatedClient);
    } else {
      await createClient({
        name: booking.clientName,
        phone: booking.phone,
        email: booking.clientEmail,
        isTemporary: false,
      });
    }
  } catch (error) {
    console.error('Error creating/updating client from booking:', error);
  }
};

export const getClientsFromBookings = async (): Promise<Client[]> => {
  try {
    const bookings = await getBookingsForCurrentBarbershop();
    const clientsMap = new Map<string, Client>();

    bookings.forEach((booking) => {
      if (booking.clientName && booking.phone) {
        const clientKey = booking.phone;
        if (!clientsMap.has(clientKey)) {
          clientsMap.set(clientKey, {
            id: clientKey,
            name: booking.clientName,
            phone: booking.phone,
            email: booking.clientEmail,
            isTemporary: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.userType === 'barber') {
      const manualClients = await getClients();
      manualClients.forEach((client) => {
        if (!clientsMap.has(client.phone)) {
          clientsMap.set(client.phone, client);
        }
      });
    }

    return Array.from(clientsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error('Error getting clients from bookings:', error);
    return [];
  }
};

export const getBookingsForCurrentBarbershop = async (): Promise<Booking[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.userType !== 'barber') {
      return [];
    }

    const barbershop = await getBarbershopByOwnerId(currentUser.id!);
    if (!barbershop) {
      return [];
    }

    return await getBookingsByBarbershopId(barbershop.id);
  } catch (error) {
    console.error('Error getting bookings for current barbershop:', error);
    return [];
  }
};
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isTemporary?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  conditions: string;
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const CLIENTS_STORAGE_KEY = 'barber_clients';
const SERVICES_STORAGE_KEY = 'barber_services';
const PRODUCTS_STORAGE_KEY = 'barber_products';
const PRICING_RULES_STORAGE_KEY = 'barber_pricing_rules';
const APPOINTMENTS_STORAGE_KEY = 'barber_appointments';

const initBarberManagement = async () => {
  const keys = [
    CLIENTS_STORAGE_KEY,
    SERVICES_STORAGE_KEY,
    PRODUCTS_STORAGE_KEY,
    PRICING_RULES_STORAGE_KEY,
    APPOINTMENTS_STORAGE_KEY,
  ];
  for (const key of keys) {
    const data = await AsyncStorage.getItem(key);
    if (!data) {
      let initialData: any[] = [];

      if (key === CLIENTS_STORAGE_KEY) {
        initialData = [
          {
            id: '1',
            name: 'João Silva',
            phone: '(11) 99999-1111',
            email: 'joao@email.com',
            isTemporary: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Maria Santos',
            phone: '(11) 99999-2222',
            email: 'maria@email.com',
            isTemporary: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Pedro Costa',
            phone: '(11) 99999-3333',
            email: 'pedro@email.com',
            isTemporary: false,
            createdAt: new Date().toISOString(),
          },
        ];
      } else if (key === SERVICES_STORAGE_KEY) {
        initialData = [
          {
            id: '1',
            name: 'Corte Masculino',
            price: 25,
            duration: 30,
            category: 'Corte',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Barba Completa',
            price: 20,
            duration: 25,
            category: 'Barba',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Corte + Barba',
            price: 40,
            duration: 50,
            category: 'Combo',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Sobrancelha',
            price: 15,
            duration: 15,
            category: 'Estética',
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ];
      }

      await AsyncStorage.setItem(key, JSON.stringify(initialData));
    }
  }
};

export const getClients = async (): Promise<Client[]> => {
  await initBarberManagement();

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== 'barber') {
    return [];
  }

  const barbershop = await getBarbershopByOwnerId(currentUser.id!);
  if (!barbershop) {
    return [];
  }

  const barbershopClientsKey = `${CLIENTS_STORAGE_KEY}_${barbershop.id}`;
  const json = await AsyncStorage.getItem(barbershopClientsKey);
  return json ? JSON.parse(json) : [];
};

export const createClient = async (
  client: Omit<Client, 'id' | 'createdAt'>
): Promise<Client> => {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== 'barber') {
    throw new Error('Only barbers can create clients');
  }

  const barbershop = await getBarbershopByOwnerId(currentUser.id!);
  if (!barbershop) {
    throw new Error('Barbershop not found');
  }

  const clients = await getClients();
  const newClient: Client = {
    ...client,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  clients.push(newClient);

  const barbershopClientsKey = `${CLIENTS_STORAGE_KEY}_${barbershop.id}`;
  await AsyncStorage.setItem(barbershopClientsKey, JSON.stringify(clients));
  return newClient;
};

export const updateClient = async (client: Client): Promise<void> => {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== 'barber') {
    throw new Error('Only barbers can update clients');
  }

  const barbershop = await getBarbershopByOwnerId(currentUser.id!);
  if (!barbershop) {
    throw new Error('Barbershop not found');
  }

  const clients = await getClients();
  const index = clients.findIndex((c) => c.id === client.id);
  if (index !== -1) {
    clients[index] = client;
    const barbershopClientsKey = `${CLIENTS_STORAGE_KEY}_${barbershop.id}`;
    await AsyncStorage.setItem(barbershopClientsKey, JSON.stringify(clients));
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.userType !== 'barber') {
    throw new Error('Only barbers can delete clients');
  }

  const barbershop = await getBarbershopByOwnerId(currentUser.id!);
  if (!barbershop) {
    throw new Error('Barbershop not found');
  }

  const clients = await getClients();
  const filtered = clients.filter((c) => c.id !== clientId);
  const barbershopClientsKey = `${CLIENTS_STORAGE_KEY}_${barbershop.id}`;
  await AsyncStorage.setItem(barbershopClientsKey, JSON.stringify(filtered));
};

export const getServices = async (): Promise<Service[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(SERVICES_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createService = async (
  service: Omit<Service, 'id' | 'createdAt'>
): Promise<Service> => {
  const services = await getServices();
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  services.push(newService);
  await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  return newService;
};

export const updateService = async (service: Service): Promise<void> => {
  const services = await getServices();
  const index = services.findIndex((s) => s.id === service.id);
  if (index !== -1) {
    services[index] = service;
    await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  }
};

export const deleteService = async (serviceId: string): Promise<void> => {
  const services = await getServices();
  const filtered = services.filter((s) => s.id !== serviceId);
  await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(filtered));
};

export const getProducts = async (): Promise<Product[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createProduct = async (
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> => {
  const products = await getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<void> => {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== productId);
  await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
};

export const getPricingRules = async (): Promise<PricingRule[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(PRICING_RULES_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createPricingRule = async (
  rule: Omit<PricingRule, 'id' | 'createdAt'>
): Promise<PricingRule> => {
  const rules = await getPricingRules();
  const newRule: PricingRule = {
    ...rule,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  rules.push(newRule);
  await AsyncStorage.setItem(PRICING_RULES_STORAGE_KEY, JSON.stringify(rules));
  return newRule;
};

export const updatePricingRule = async (rule: PricingRule): Promise<void> => {
  const rules = await getPricingRules();
  const index = rules.findIndex((r) => r.id === rule.id);
  if (index !== -1) {
    rules[index] = rule;
    await AsyncStorage.setItem(
      PRICING_RULES_STORAGE_KEY,
      JSON.stringify(rules)
    );
  }
};

export const deletePricingRule = async (ruleId: string): Promise<void> => {
  const rules = await getPricingRules();
  const filtered = rules.filter((r) => r.id !== ruleId);
  await AsyncStorage.setItem(
    PRICING_RULES_STORAGE_KEY,
    JSON.stringify(filtered)
  );
};

export const getAppointments = async (): Promise<Appointment[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<Appointment> => {
  const appointments = await getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  appointments.push(newAppointment);
  await AsyncStorage.setItem(
    APPOINTMENTS_STORAGE_KEY,
    JSON.stringify(appointments)
  );
  return newAppointment;
};

export const updateAppointment = async (
  appointment: Appointment
): Promise<void> => {
  const appointments = await getAppointments();
  const index = appointments.findIndex((a) => a.id === appointment.id);
  if (index !== -1) {
    appointments[index] = appointment;
    await AsyncStorage.setItem(
      APPOINTMENTS_STORAGE_KEY,
      JSON.stringify(appointments)
    );
  }
};

export const deleteAppointment = async (
  appointmentId: string
): Promise<void> => {
  const appointments = await getAppointments();
  const filtered = appointments.filter((a) => a.id !== appointmentId);
  await AsyncStorage.setItem(
    APPOINTMENTS_STORAGE_KEY,
    JSON.stringify(filtered)
  );
};

export const createBarbershop = async (
  barbershop: Omit<Barbershop, 'id' | 'createdAt'>
): Promise<Barbershop | null> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(
      BARBERSHOPS_STORAGE_KEY
    );
    const barbershops: Barbershop[] = barbershopsJson
      ? JSON.parse(barbershopsJson)
      : [];

    const counterStr =
      (await SecureStore.getItemAsync(BARBERSHOP_COUNTER_KEY)) || '1';
    const counter = parseInt(counterStr, 10);

    const newBarbershop: Barbershop = {
      ...barbershop,
      id: counter,
      createdAt: new Date().toISOString(),
    };

    barbershops.push(newBarbershop);
    await SecureStore.setItemAsync(
      BARBERSHOPS_STORAGE_KEY,
      JSON.stringify(barbershops)
    );
    await SecureStore.setItemAsync(
      BARBERSHOP_COUNTER_KEY,
      (counter + 1).toString()
    );

    return newBarbershop;
  } catch (error) {
    console.error('Error creating barbershop:', error);
    return null;
  }
};

export const getBarbershopByOwnerId = async (
  ownerId: number
): Promise<Barbershop | null> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(
      BARBERSHOPS_STORAGE_KEY
    );
    const barbershops: Barbershop[] = barbershopsJson
      ? JSON.parse(barbershopsJson)
      : [];
    return barbershops.find((b) => b.ownerId === ownerId) || null;
  } catch (error) {
    console.error('Error getting barbershop:', error);
    return null;
  }
};

export const getAllBarbershops = async (): Promise<Barbershop[]> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(
      BARBERSHOPS_STORAGE_KEY
    );
    const barbershops: Barbershop[] = barbershopsJson
      ? JSON.parse(barbershopsJson)
      : [];
    return barbershops;
  } catch (error) {
    console.error('Error getting all barbershops:', error);
    return [];
  }
};

export const getBarbershopById = async (
  id: number
): Promise<Barbershop | null> => {
  try {
    const barbershops = await getAllBarbershops();
    return barbershops.find((b) => b.id === id) || null;
  } catch (error) {
    console.error('Error getting barbershop by ID:', error);
    return null;
  }
};

export const updateBarbershop = async (
  barbershop: Barbershop
): Promise<boolean> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(
      BARBERSHOPS_STORAGE_KEY
    );
    const barbershops: Barbershop[] = barbershopsJson
      ? JSON.parse(barbershopsJson)
      : [];

    const index = barbershops.findIndex((b) => b.id === barbershop.id);
    if (index !== -1) {
      barbershops[index] = barbershop;
      await SecureStore.setItemAsync(
        BARBERSHOPS_STORAGE_KEY,
        JSON.stringify(barbershops)
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating barbershop:', error);
    return false;
  }
};

export const createBarberProfile = async (
  profile: Omit<BarberProfile, 'id' | 'joinedAt'>
): Promise<BarberProfile | null> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(
      BARBER_PROFILES_STORAGE_KEY
    );
    const profiles: BarberProfile[] = profilesJson
      ? JSON.parse(profilesJson)
      : [];

    const counterStr =
      (await SecureStore.getItemAsync(BARBER_PROFILE_COUNTER_KEY)) || '1';
    const counter = parseInt(counterStr, 10);

    const newProfile: BarberProfile = {
      ...profile,
      id: counter,
      joinedAt: new Date().toISOString(),
    };

    profiles.push(newProfile);
    await SecureStore.setItemAsync(
      BARBER_PROFILES_STORAGE_KEY,
      JSON.stringify(profiles)
    );
    await SecureStore.setItemAsync(
      BARBER_PROFILE_COUNTER_KEY,
      (counter + 1).toString()
    );

    return newProfile;
  } catch (error) {
    console.error('Error creating barber profile:', error);
    return null;
  }
};

export const getBarberProfileByUserId = async (
  userId: number
): Promise<BarberProfile | null> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(
      BARBER_PROFILES_STORAGE_KEY
    );
    const profiles: BarberProfile[] = profilesJson
      ? JSON.parse(profilesJson)
      : [];
    return profiles.find((p) => p.userId === userId) || null;
  } catch (error) {
    console.error('Error getting barber profile:', error);
    return null;
  }
};

export const getBarbersByBarbershopId = async (
  barbershopId: number
): Promise<BarberProfile[]> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(
      BARBER_PROFILES_STORAGE_KEY
    );
    const profiles: BarberProfile[] = profilesJson
      ? JSON.parse(profilesJson)
      : [];
    return profiles.filter(
      (p) => p.barbershopId === barbershopId && p.isActive
    );
  } catch (error) {
    console.error('Error getting barbers:', error);
    return [];
  }
};

export const updateBarberProfile = async (
  profile: BarberProfile
): Promise<boolean> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(
      BARBER_PROFILES_STORAGE_KEY
    );
    const profiles: BarberProfile[] = profilesJson
      ? JSON.parse(profilesJson)
      : [];

    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index !== -1) {
      profiles[index] = profile;
      await SecureStore.setItemAsync(
        BARBER_PROFILES_STORAGE_KEY,
        JSON.stringify(profiles)
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating barber profile:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }

    const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  try {
    if (user) {
      await SecureStore.setItemAsync(CURRENT_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

export const isUserLoggedIn = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};

export const getDefaultWorkingHours = (): WorkingHours => {
  const defaultDay: DaySchedule = {
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
  };

  const closedDay: DaySchedule = {
    isOpen: false,
    openTime: '09:00',
    closeTime: '18:00',
  };

  return {
    monday: defaultDay,
    tuesday: defaultDay,
    wednesday: defaultDay,
    thursday: defaultDay,
    friday: defaultDay,
    saturday: defaultDay,
    sunday: closedDay,
  };
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}`;
};

export const validateBarberWorkingHours = (
  barberHours: Partial<WorkingHours>,
  barbershopHours: WorkingHours
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  for (const day of days) {
    const barberDay = barberHours[day];
    const barbershopDay = barbershopHours[day];

    if (!barberDay || !barberDay.isOpen) continue;
    if (!barbershopDay || !barbershopDay.isOpen) {
      errors.push(`${day}: Barbearia fechada neste dia`);
      continue;
    }

    const barberOpen = timeToMinutes(barberDay.openTime);
    const barberClose = timeToMinutes(barberDay.closeTime);
    const barbershopOpen = timeToMinutes(barbershopDay.openTime);
    const barbershopClose = timeToMinutes(barbershopDay.closeTime);

    if (barberOpen < barbershopOpen) {
      errors.push(
        `${day}: Horário de abertura do barbeiro deve ser após ${barbershopDay.openTime}`
      );
    }

    if (barberClose > barbershopClose) {
      errors.push(
        `${day}: Horário de fechamento do barbeiro deve ser antes de ${barbershopDay.closeTime}`
      );
    }

    if (barberDay.breakStart && barberDay.breakEnd) {
      const barberBreakStart = timeToMinutes(barberDay.breakStart);
      const barberBreakEnd = timeToMinutes(barberDay.breakEnd);

      if (barbershopDay.breakStart && barbershopDay.breakEnd) {
        const barbershopBreakStart = timeToMinutes(barbershopDay.breakStart);
        const barbershopBreakEnd = timeToMinutes(barbershopDay.breakEnd);

        if (
          barberBreakStart < barbershopBreakStart ||
          barberBreakEnd > barbershopBreakEnd
        ) {
          errors.push(
            `${day}: Horário de almoço do barbeiro deve estar dentro do horário da barbearia (${barbershopDay.breakStart} - ${barbershopDay.breakEnd})`
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getEffectiveBarberWorkingHours = (
  barberProfile: BarberProfile,
  barbershopHours: WorkingHours
): WorkingHours => {
  const result = { ...barbershopHours };

  if (barberProfile.customWorkingHours) {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ] as const;

    for (const day of days) {
      const customDay = barberProfile.customWorkingHours[day];
      if (customDay) {
        result[day] = customDay;
      }
    }
  }

  return result;
};

export const isTimeSlotAvailable = (
  barberProfile: BarberProfile,
  barbershopHours: WorkingHours,
  dayOfWeek: string,
  time: string
): boolean => {
  const effectiveHours = getEffectiveBarberWorkingHours(
    barberProfile,
    barbershopHours
  );
  const daySchedule = effectiveHours[dayOfWeek as keyof WorkingHours];

  if (!daySchedule || !daySchedule.isOpen) return false;

  const timeMinutes = timeToMinutes(time);
  const openMinutes = timeToMinutes(daySchedule.openTime);
  const closeMinutes = timeToMinutes(daySchedule.closeTime);

  if (timeMinutes < openMinutes || timeMinutes >= closeMinutes) return false;

  if (daySchedule.breakStart && daySchedule.breakEnd) {
    const breakStartMinutes = timeToMinutes(daySchedule.breakStart);
    const breakEndMinutes = timeToMinutes(daySchedule.breakEnd);

    if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
      return false;
    }
  }

  return true;
};

export const updateBarberWorkingHours = async (
  barberId: number,
  customWorkingHours: Partial<WorkingHours>
): Promise<{ success: boolean; errors?: string[] }> => {
  try {
    const profile = await getBarberProfileByUserId(barberId);
    if (!profile) {
      return { success: false, errors: ['Perfil do barbeiro não encontrado'] };
    }

    const barbershop = await getBarbershopByOwnerId(profile.barbershopId);
    if (!barbershop) {
      return { success: false, errors: ['Barbearia não encontrada'] };
    }

    const validation = validateBarberWorkingHours(
      customWorkingHours,
      barbershop.workingHours
    );
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const updatedProfile = {
      ...profile,
      customWorkingHours,
    };

    const success = await updateBarberProfile(updatedProfile);
    return { success };
  } catch (error) {
    console.error('Error updating barber working hours:', error);
    return { success: false, errors: ['Erro interno do sistema'] };
  }
};

export const updateBarbershopServices = async (
  barbershopId: number,
  services: Service[]
): Promise<boolean> => {
  try {
    const barbershop = await getBarbershopById(barbershopId);
    if (!barbershop) return false;

    const updatedBarbershop = {
      ...barbershop,
      services: services,
    };

    const success = await updateBarbershop(updatedBarbershop);

    if (success) {
      console.log(
        `Barbershop ${barbershopId} services updated - will be visible to clients immediately`
      );
    }

    return success;
  } catch (error) {
    console.error('Error updating barbershop services:', error);
    return false;
  }
};

export const updateBarbershopWorkingHours = async (
  barbershopId: number,
  workingHours: WorkingHours
): Promise<boolean> => {
  try {
    const barbershop = await getBarbershopById(barbershopId);
    if (!barbershop) return false;

    const updatedBarbershop = {
      ...barbershop,
      workingHours: workingHours,
    };

    const success = await updateBarbershop(updatedBarbershop);

    if (success) {
      console.log(
        `Barbershop ${barbershopId} working hours updated - will be visible to clients immediately`
      );
    }

    return success;
  } catch (error) {
    console.error('Error updating barbershop working hours:', error);
    return false;
  }
};

export const refreshBarbershopData = async (
  barberId: string
): Promise<{
  services: Service[];
  workingHours: WorkingHours | null;
  info: { name: string; address: string; phone: string };
}> => {
  try {
    let barbershopData: Barbershop | null = null;

    if (barberId.startsWith('real_')) {
      const realBarbershopId = parseInt(barberId.replace('real_', ''));
      barbershopData = await getBarbershopById(realBarbershopId);
    } else if (!isNaN(Number(barberId))) {
      barbershopData = await getBarbershopById(Number(barberId));
    }

    if (barbershopData) {
      return {
        services: barbershopData.services || [],
        workingHours: barbershopData.workingHours,
        info: {
          name: barbershopData.name,
          address: barbershopData.address,
          phone: barbershopData.phone,
        },
      };
    }

    return {
      services: [
        {
          id: '1',
          name: 'Corte Masculino',
          duration: 30,
          price: 25,
          category: 'Corte',
          isActive: true,
        },
        {
          id: '2',
          name: 'Barba',
          duration: 20,
          price: 15,
          category: 'Barba',
          isActive: true,
        },
        {
          id: '3',
          name: 'Corte + Barba',
          duration: 45,
          price: 35,
          category: 'Combo',
          isActive: true,
        },
      ],
      workingHours: null,
      info: {
        name: 'Barbearia',
        address: 'Rua Example, 123',
        phone: '(11) 99999-9999',
      },
    };
  } catch (error) {
    console.error('Error refreshing barbershop data:', error);
    return {
      services: [],
      workingHours: null,
      info: { name: 'Barbearia', address: '', phone: '' },
    };
  }
};

export const testIntegratedSystem = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔄 Testing integrated barbershop system...');

    await initDatabase();
    await initBookingsDatabase();
    await initBarbersDatabase();

    const allBarbers = await getBarbers();
    console.log(`✅ Found ${allBarbers.length} barbers (mock + registered)`);

    const barbershops = await getAllBarbershops();
    console.log(`✅ Found ${barbershops.length} registered barbershops`);

    const currentUser = await getCurrentUser();
    console.log(
      `✅ Current user: ${currentUser ? currentUser.name : 'None logged in'}`
    );

    if (currentUser && currentUser.userType === 'barber') {
      const appointments = await getAppointmentsForCurrentBarber();
      console.log(
        `✅ Found ${appointments.length} appointments for current barber`
      );
    }

    if (currentUser && currentUser.userType === 'client') {
      const userBookings = await getBookingsByUserId(currentUser.id!);
      console.log(`✅ Found ${userBookings.length} bookings for current user`);
    }

    return {
      success: true,
      message: `Sistema integrado funcionando! ${allBarbers.length} barbearias disponíveis, ${barbershops.length} cadastradas no sistema.`,
    };
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return {
      success: false,
      message: `Erro no sistema: ${error}`,
    };
  }
};

export const getSystemStats = async (): Promise<{
  totalBarbers: number;
  registeredBarbershops: number;
  totalUsers: number;
  totalBookings: number;
  totalAppointments: number;
}> => {
  try {
    const [barbers, barbershops, bookings, appointments] = await Promise.all([
      getBarbers(),
      getAllBarbershops(),
      getBookings(),
      getAppointments(),
    ]);

    let totalUsers = 0;
    try {
      const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      totalUsers = users.length;
    } catch (error) {
      console.log('Could not get users count');
    }

    return {
      totalBarbers: barbers.length,
      registeredBarbershops: barbershops.length,
      totalUsers,
      totalBookings: bookings.length,
      totalAppointments: appointments.length,
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalBarbers: 0,
      registeredBarbershops: 0,
      totalUsers: 0,
      totalBookings: 0,
      totalAppointments: 0,
    };
  }
};

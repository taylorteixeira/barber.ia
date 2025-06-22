import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs';

// Fallback para aleatoriedade no bcryptjs em ambiente React Native/Expo
if (typeof bcrypt.setRandomFallback === 'function') {
  bcrypt.setRandomFallback((len: number) => {
    const buf = Array.from({ length: len }, () => Math.floor(Math.random() * 256));
    return buf;
  });
}

// User interface
export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: 'client' | 'barber';
  barbershopId?: number; // Para vincular barbeiro à barbearia
}

// Barbershop interface
export interface Barbershop {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  workingHours: WorkingHours;
  ownerId: number; // ID do barbeiro dono
  services: Service[];
  createdAt: string;
}

// Working Hours interface
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
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  breakStart?: string; // "12:00"
  breakEnd?: string; // "13:00"
}

// Barber profile interface
export interface BarberProfile {
  id: number;
  userId: number;
  barbershopId: number;
  specialties: string[];
  workingDays: string[]; // ['monday', 'tuesday', etc.]
  customWorkingHours?: Partial<WorkingHours>; // Horários específicos do barbeiro
  avatar?: string;
  bio?: string;
  isActive: boolean;
  joinedAt: string;
}

// Service interface
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price: number;
  category: string;
  barbershopId?: number;
  isActive: boolean;
  createdAt?: string;
}

// Storage keys
const USERS_STORAGE_KEY = 'barber_users';
const CURRENT_USER_KEY = 'barber_current_user';
const USER_COUNTER_KEY = 'barber_user_counter';
const BARBERSHOPS_STORAGE_KEY = 'barbershops';
const BARBER_PROFILES_STORAGE_KEY = 'barber_profiles';
const BARBERSHOP_COUNTER_KEY = 'barbershop_counter';
const BARBER_PROFILE_COUNTER_KEY = 'barber_profile_counter';

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  try {
    // Check if we already have a users array in storage
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    if (!usersJson) {
      // Initialize with empty array
      await SecureStore.setItemAsync(USERS_STORAGE_KEY, JSON.stringify([]));
      await SecureStore.setItemAsync(USER_COUNTER_KEY, '1');
    }
    
    // Initialize barbershops storage
    const barbershopsJson = await SecureStore.getItemAsync(BARBERSHOPS_STORAGE_KEY);
    if (!barbershopsJson) {
      await SecureStore.setItemAsync(BARBERSHOPS_STORAGE_KEY, JSON.stringify([]));
      await SecureStore.setItemAsync(BARBERSHOP_COUNTER_KEY, '1');
    }
    
    // Initialize barber profiles storage
    const barberProfilesJson = await SecureStore.getItemAsync(BARBER_PROFILES_STORAGE_KEY);
    if (!barberProfilesJson) {
      await SecureStore.setItemAsync(BARBER_PROFILES_STORAGE_KEY, JSON.stringify([]));
      await SecureStore.setItemAsync(BARBER_PROFILE_COUNTER_KEY, '1');
    }
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (user: User): Promise<boolean> => {
  try {
    // Get existing users
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    if (!usersJson) {
      await initDatabase();
    }

    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check if email already exists
    const emailExists = users.some((u) => u.email === user.email);
    if (emailExists) {
      return false;
    }

    // Get next user ID
    const counterStr =
      (await SecureStore.getItemAsync(USER_COUNTER_KEY)) || '1';
    const counter = parseInt(counterStr, 10);

    // Hash password
    let hashedPassword: string;
    try {
      const saltRounds = 10;
      console.log('bcrypt saltRounds type:', typeof saltRounds, saltRounds);
      hashedPassword = bcrypt.hashSync(user.password, saltRounds);
    } catch (err) {
      console.error('Bcrypt hash error:', err);
      return false;
    }    // Create new user
    const newUser: User = {
      id: counter,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: hashedPassword,
      userType: user.userType,
    };

    // Add to users array
    users.push(newUser);

    // Save updated users array
    await SecureStore.setItemAsync(USERS_STORAGE_KEY, JSON.stringify(users));

    // Increment counter
    await SecureStore.setItemAsync(USER_COUNTER_KEY, (counter + 1).toString());

    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
};

// Login a user
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

    // Find user by email
    const user = users.find((u) => u.email === email);

    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);    if (isPasswordValid) {
      // Store user session without password
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

// Check if user is logged in
export const checkUserSession = async (): Promise<boolean> => {
  try {
    const user = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    return !!user;
  } catch (error) {
    console.error('Error checking user session:', error);
    return false;
  }
};

// Logout current user
export const logoutUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

// Get current user data
export const getCurrentUser = async (): Promise<any | null> => {
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

// Update user data
export const updateUser = async (user: User): Promise<boolean> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
      await SecureStore.setItemAsync(USERS_STORAGE_KEY, JSON.stringify(users));
      
      // Update current user session if it's the same user
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id === user.id) {
        await SecureStore.setItemAsync(CURRENT_USER_KEY, JSON.stringify(users[index]));
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    return users.find(u => u.id === userId) || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Barber interface and storage functions
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
}
const BARBERS_STORAGE_KEY = 'barber_barbers';

// Initialize barbers storage if not present
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
        id: '1',
        name: 'Barbearia Premium',
        rating: 4.8,
        distance: 0.5,
        price: 35,
        image:
          'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
        reviews: 124,
        location: { latitude: -23.5505, longitude: -46.6333 },
      },
      {
        id: '2',
        name: 'Cortes Modernos',
        rating: 4.6,
        distance: 1.2,
        price: 28,
        image:
          'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
        reviews: 89,
        location: { latitude: -23.5515, longitude: -46.6343 },
      },
      {
        id: '3',
        name: 'Studio do Barbeiro',
        rating: 4.9,
        distance: 0.8,
        price: 42,
        image:
          'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
        reviews: 156,
        location: { latitude: -23.5495, longitude: -46.6323 },
      },
    ];
    await AsyncStorage.setItem(
      BARBERS_STORAGE_KEY,
      JSON.stringify(exampleBarbers)
    );
  }
};

// Retrieve all barbers
export const getBarbers = async (): Promise<Barber[]> => {
  await initBarbersDatabase();
  const json = await AsyncStorage.getItem(BARBERS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

// Booking interface and storage functions
export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';
export interface Booking {
  id: string;
  barberName: string;
  barberImage: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  address: string;
  phone: string;
}
const BOOKINGS_STORAGE_KEY = 'barber_bookings';

// Initialize bookings storage
export const initBookingsDatabase = async (): Promise<void> => {
  const data = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (!data) {
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Retrieve all bookings
export const getBookings = async (): Promise<Booking[]> => {
  await initBookingsDatabase();
  const json = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

// Update a booking status
export const updateBooking = async (updatedBooking: Booking): Promise<void> => {
  const bookings = await getBookings();
  const newList = bookings.map((b) =>
    b.id === updatedBooking.id ? updatedBooking : b
  );
  await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(newList));
};

// Create a new booking
export const createBooking = async (newBooking: Booking): Promise<void> => {
  const bookings = await getBookings();
  bookings.push(newBooking);
  await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
};

// Interfaces for Barber Management System
export interface Client {
  id: string;
  name: string;  phone: string;
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

// Storage keys for barber management
const CLIENTS_STORAGE_KEY = 'barber_clients';
const SERVICES_STORAGE_KEY = 'barber_services';
const PRODUCTS_STORAGE_KEY = 'barber_products';
const PRICING_RULES_STORAGE_KEY = 'barber_pricing_rules';
const APPOINTMENTS_STORAGE_KEY = 'barber_appointments';

// Initialize barber management data
const initBarberManagement = async () => {
  const keys = [
    CLIENTS_STORAGE_KEY,
    SERVICES_STORAGE_KEY,
    PRODUCTS_STORAGE_KEY,
    PRICING_RULES_STORAGE_KEY,
    APPOINTMENTS_STORAGE_KEY
  ];
  for (const key of keys) {
    const data = await AsyncStorage.getItem(key);
    if (!data) {
      let initialData: any[] = [];
      
      // Add mock data for development
      if (key === CLIENTS_STORAGE_KEY) {
        initialData = [
          {
            id: '1',
            name: 'João Silva',
            phone: '(11) 99999-1111',
            email: 'joao@email.com',
            isTemporary: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Maria Santos',
            phone: '(11) 99999-2222',
            email: 'maria@email.com',
            isTemporary: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Pedro Costa',
            phone: '(11) 99999-3333',
            email: 'pedro@email.com',
            isTemporary: false,
            createdAt: new Date().toISOString()
          }
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
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Barba Completa',
            price: 20,
            duration: 25,
            category: 'Barba',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Corte + Barba',
            price: 40,
            duration: 50,
            category: 'Combo',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Sobrancelha',
            price: 15,
            duration: 15,
            category: 'Estética',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ];
      }

      await AsyncStorage.setItem(key, JSON.stringify(initialData));
    }
  }
};

// Client functions
export const getClients = async (): Promise<Client[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(CLIENTS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createClient = async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
  const clients = await getClients();
  const newClient: Client = {
    ...client,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  clients.push(newClient);
  await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  return newClient;
};

export const updateClient = async (client: Client): Promise<void> => {
  const clients = await getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index !== -1) {
    clients[index] = client;
    await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const clients = await getClients();
  const filtered = clients.filter(c => c.id !== clientId);
  await AsyncStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(filtered));
};

// Service functions
export const getServices = async (): Promise<Service[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(SERVICES_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createService = async (service: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
  const services = await getServices();
  const newService: Service = {
    ...service,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  services.push(newService);
  await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  return newService;
};

export const updateService = async (service: Service): Promise<void> => {
  const services = await getServices();
  const index = services.findIndex(s => s.id === service.id);
  if (index !== -1) {
    services[index] = service;
    await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  }
};

export const deleteService = async (serviceId: string): Promise<void> => {
  const services = await getServices();
  const filtered = services.filter(s => s.id !== serviceId);
  await AsyncStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(filtered));
};

// Product functions
export const getProducts = async (): Promise<Product[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  const products = await getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<void> => {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== productId);
  await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
};

// Pricing rule functions
export const getPricingRules = async (): Promise<PricingRule[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(PRICING_RULES_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createPricingRule = async (rule: Omit<PricingRule, 'id' | 'createdAt'>): Promise<PricingRule> => {
  const rules = await getPricingRules();
  const newRule: PricingRule = {
    ...rule,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  rules.push(newRule);
  await AsyncStorage.setItem(PRICING_RULES_STORAGE_KEY, JSON.stringify(rules));
  return newRule;
};

export const updatePricingRule = async (rule: PricingRule): Promise<void> => {
  const rules = await getPricingRules();
  const index = rules.findIndex(r => r.id === rule.id);
  if (index !== -1) {
    rules[index] = rule;
    await AsyncStorage.setItem(PRICING_RULES_STORAGE_KEY, JSON.stringify(rules));
  }
};

export const deletePricingRule = async (ruleId: string): Promise<void> => {
  const rules = await getPricingRules();
  const filtered = rules.filter(r => r.id !== ruleId);
  await AsyncStorage.setItem(PRICING_RULES_STORAGE_KEY, JSON.stringify(filtered));
};

// Appointment functions
export const getAppointments = async (): Promise<Appointment[]> => {
  await initBarberManagement();
  const json = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> => {
  const appointments = await getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  appointments.push(newAppointment);
  await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  return newAppointment;
};

export const updateAppointment = async (appointment: Appointment): Promise<void> => {
  const appointments = await getAppointments();
  const index = appointments.findIndex(a => a.id === appointment.id);
  if (index !== -1) {
    appointments[index] = appointment;
    await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  }
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  const appointments = await getAppointments();
  const filtered = appointments.filter(a => a.id !== appointmentId);
  await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(filtered));
};

// Barbershop management functions
export const createBarbershop = async (barbershop: Omit<Barbershop, 'id' | 'createdAt'>): Promise<Barbershop | null> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(BARBERSHOPS_STORAGE_KEY);
    const barbershops: Barbershop[] = barbershopsJson ? JSON.parse(barbershopsJson) : [];
    
    const counterStr = await SecureStore.getItemAsync(BARBERSHOP_COUNTER_KEY) || '1';
    const counter = parseInt(counterStr, 10);
    
    const newBarbershop: Barbershop = {
      ...barbershop,
      id: counter,
      createdAt: new Date().toISOString(),
    };
    
    barbershops.push(newBarbershop);
    await SecureStore.setItemAsync(BARBERSHOPS_STORAGE_KEY, JSON.stringify(barbershops));
    await SecureStore.setItemAsync(BARBERSHOP_COUNTER_KEY, (counter + 1).toString());
    
    return newBarbershop;
  } catch (error) {
    console.error('Error creating barbershop:', error);
    return null;
  }
};

export const getBarbershopByOwnerId = async (ownerId: number): Promise<Barbershop | null> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(BARBERSHOPS_STORAGE_KEY);
    const barbershops: Barbershop[] = barbershopsJson ? JSON.parse(barbershopsJson) : [];
    return barbershops.find(b => b.ownerId === ownerId) || null;
  } catch (error) {
    console.error('Error getting barbershop:', error);
    return null;
  }
};

export const updateBarbershop = async (barbershop: Barbershop): Promise<boolean> => {
  try {
    const barbershopsJson = await SecureStore.getItemAsync(BARBERSHOPS_STORAGE_KEY);
    const barbershops: Barbershop[] = barbershopsJson ? JSON.parse(barbershopsJson) : [];
    
    const index = barbershops.findIndex(b => b.id === barbershop.id);
    if (index !== -1) {
      barbershops[index] = barbershop;
      await SecureStore.setItemAsync(BARBERSHOPS_STORAGE_KEY, JSON.stringify(barbershops));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating barbershop:', error);
    return false;
  }
};

// Barber profile management functions
export const createBarberProfile = async (profile: Omit<BarberProfile, 'id' | 'joinedAt'>): Promise<BarberProfile | null> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(BARBER_PROFILES_STORAGE_KEY);
    const profiles: BarberProfile[] = profilesJson ? JSON.parse(profilesJson) : [];
    
    const counterStr = await SecureStore.getItemAsync(BARBER_PROFILE_COUNTER_KEY) || '1';
    const counter = parseInt(counterStr, 10);
    
    const newProfile: BarberProfile = {
      ...profile,
      id: counter,
      joinedAt: new Date().toISOString(),
    };
    
    profiles.push(newProfile);
    await SecureStore.setItemAsync(BARBER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    await SecureStore.setItemAsync(BARBER_PROFILE_COUNTER_KEY, (counter + 1).toString());
    
    return newProfile;
  } catch (error) {
    console.error('Error creating barber profile:', error);
    return null;
  }
};

export const getBarberProfileByUserId = async (userId: number): Promise<BarberProfile | null> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(BARBER_PROFILES_STORAGE_KEY);
    const profiles: BarberProfile[] = profilesJson ? JSON.parse(profilesJson) : [];
    return profiles.find(p => p.userId === userId) || null;
  } catch (error) {
    console.error('Error getting barber profile:', error);
    return null;
  }
};

export const getBarbersByBarbershopId = async (barbershopId: number): Promise<BarberProfile[]> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(BARBER_PROFILES_STORAGE_KEY);
    const profiles: BarberProfile[] = profilesJson ? JSON.parse(profilesJson) : [];
    return profiles.filter(p => p.barbershopId === barbershopId && p.isActive);
  } catch (error) {
    console.error('Error getting barbers:', error);
    return [];
  }
};

export const updateBarberProfile = async (profile: BarberProfile): Promise<boolean> => {
  try {
    const profilesJson = await SecureStore.getItemAsync(BARBER_PROFILES_STORAGE_KEY);
    const profiles: BarberProfile[] = profilesJson ? JSON.parse(profilesJson) : [];
    
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index !== -1) {
      profiles[index] = profile;
      await SecureStore.setItemAsync(BARBER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating barber profile:', error);
    return false;
  }
};

// Default working hours
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

// Utility functions for working hours validation
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Validate if barber's working hours are within barbershop's working hours
export const validateBarberWorkingHours = (
  barberHours: Partial<WorkingHours>,
  barbershopHours: WorkingHours
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  
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
      errors.push(`${day}: Horário de abertura do barbeiro deve ser após ${barbershopDay.openTime}`);
    }
    
    if (barberClose > barbershopClose) {
      errors.push(`${day}: Horário de fechamento do barbeiro deve ser antes de ${barbershopDay.closeTime}`);
    }
    
    // Validate break times if they exist
    if (barberDay.breakStart && barberDay.breakEnd) {
      const barberBreakStart = timeToMinutes(barberDay.breakStart);
      const barberBreakEnd = timeToMinutes(barberDay.breakEnd);
      
      if (barbershopDay.breakStart && barbershopDay.breakEnd) {
        const barbershopBreakStart = timeToMinutes(barbershopDay.breakStart);
        const barbershopBreakEnd = timeToMinutes(barbershopDay.breakEnd);
        
        if (barberBreakStart < barbershopBreakStart || barberBreakEnd > barbershopBreakEnd) {
          errors.push(`${day}: Horário de almoço do barbeiro deve estar dentro do horário da barbearia (${barbershopDay.breakStart} - ${barbershopDay.breakEnd})`);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get effective working hours for a barber (combining barbershop and custom hours)
export const getEffectiveBarberWorkingHours = (
  barberProfile: BarberProfile,
  barbershopHours: WorkingHours
): WorkingHours => {
  const result = { ...barbershopHours };
  
  if (barberProfile.customWorkingHours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    
    for (const day of days) {
      const customDay = barberProfile.customWorkingHours[day];
      if (customDay) {
        result[day] = customDay;
      }
    }
  }
  
  return result;
};

// Check if a specific time slot is available for a barber
export const isTimeSlotAvailable = (
  barberProfile: BarberProfile,
  barbershopHours: WorkingHours,
  dayOfWeek: string,
  time: string
): boolean => {
  const effectiveHours = getEffectiveBarberWorkingHours(barberProfile, barbershopHours);
  const daySchedule = effectiveHours[dayOfWeek as keyof WorkingHours];
  
  if (!daySchedule || !daySchedule.isOpen) return false;
  
  const timeMinutes = timeToMinutes(time);
  const openMinutes = timeToMinutes(daySchedule.openTime);
  const closeMinutes = timeToMinutes(daySchedule.closeTime);
  
  if (timeMinutes < openMinutes || timeMinutes >= closeMinutes) return false;
  
  // Check if time is during break
  if (daySchedule.breakStart && daySchedule.breakEnd) {
    const breakStartMinutes = timeToMinutes(daySchedule.breakStart);
    const breakEndMinutes = timeToMinutes(daySchedule.breakEnd);
    
    if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
      return false;
    }
  }
  
  return true;
};

// Update barber profile with validated working hours
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
    
    const validation = validateBarberWorkingHours(customWorkingHours, barbershop.workingHours);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    const updatedProfile = {
      ...profile,
      customWorkingHours
    };
    
    const success = await updateBarberProfile(updatedProfile);
    return { success };
  } catch (error) {
    console.error('Error updating barber working hours:', error);
    return { success: false, errors: ['Erro interno do sistema'] };
  }
};

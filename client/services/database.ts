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
}

// Storage keys
const USERS_STORAGE_KEY = 'barber_users';
const CURRENT_USER_KEY = 'barber_current_user';
const USER_COUNTER_KEY = 'barber_user_counter';

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

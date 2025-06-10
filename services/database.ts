import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs';

// Fallback para aleatoriedade no bcryptjs em ambiente React Native/Expo
if (typeof bcrypt.setRandomFallback === 'function') {
  bcrypt.setRandomFallback((len: number) => {
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; ++i) {
      buf[i] = Math.floor(Math.random() * 256);
    }
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
    const emailExists = users.some(u => u.email === user.email);
    if (emailExists) {
      return false;
    }
    
    // Get next user ID
    const counterStr = await SecureStore.getItemAsync(USER_COUNTER_KEY) || '1';
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
    }
    
    // Create new user
    const newUser: User = {
      id: counter,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: hashedPassword
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
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const usersJson = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
    if (!usersJson) {
      return null;
    }
    
    const users: User[] = JSON.parse(usersJson);
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return null;
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      // Store user session without password
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      };
      
      await SecureStore.setItemAsync(CURRENT_USER_KEY, JSON.stringify(userSession));
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

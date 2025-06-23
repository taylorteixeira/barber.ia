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

// Todas as funções de armazenamento local e seed removidas.
// Implemente funções de integração com o backend neste arquivo, se necessário.

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

import axios from 'axios';

/**
 * Faz upload de uma imagem para o backend e retorna a URL salva.
 * @param uri Caminho local da imagem
 * @param type Tipo de avatar: 'barber' | 'client'
 * @param id ID do usuário/barbeiro/cliente
 */
export async function uploadAvatar(uri: string, type: 'barber' | 'client', id: string | number): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);
    const endpoint =
      type === 'barber'
        ? `http://localhost:5000/barber/${id}/avatar`
        : `http://localhost:5000/client/${id}/avatar`;
    const res = await axios.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.avatarUrl || null;
  } catch (err) {
    console.error('Erro ao fazer upload do avatar:', err);
    return null;
  }
}

// Removidas funções e referências que dependiam de funções não implementadas:
// - updateBarberWorkingHours
// - getBarberProfileByUserId
// - getBarbershopByOwnerId
// - updateBarberProfile
//
// Essas validações e integrações devem ser feitas diretamente nos componentes usando axios e os utilitários de validação já presentes neste arquivo.

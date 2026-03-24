export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  role: string;
}

export interface Master {
  id: string;
  user_id: string;
  bio?: string;
  users: User;
  master_services?: {
    master_id: string;
    service_id: string;
  }[];
}

export interface Service {
  id: string;
  title: string;
  duration: number;
  price: number;
  is_active: boolean;
  master_services?: {
    master_id: string;
    service_id: string;
  }[];
}

export interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  service_id: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: AppointmentStatus;
  actual_price: number;
  client_notes?: string;
  users: User;
  services: Service;
  masters: Master;
}

export type AppointmentStatus =
  | "Confirmed"
  | "Completed"
  | "NoShow"
  | "Cancelled";

export interface UpdateStatusArgs {
  id: string;
  status: AppointmentStatus;
}

export interface AvailableSlot {
  start: string;
  end: string;
  label: string;
}

export interface CreateAppointmentPayload {
  firstName: string;
  lastName: string;
  phone: string;
  existingClientId?: string | null;
  masterId: string;
  serviceId: string;
  startTime: string;
  actualPrice: number | string;
  clientNotes?: string | null;
}

declare global {
  interface Window {
    dbAPI: {
      login: (email: string, pass: string) => Promise<ServiceResponse<User>>;

      getAppointments: () => Promise<ServiceResponse<Appointment[]>>;

      updateStatus: (args: UpdateStatusArgs) => Promise<ServiceResponse<void>>;

      getServices: () => Promise<ServiceResponse<Service[]>>;

      getMasters: () => Promise<ServiceResponse<Master[]>>;

      getAvailableSlots: (args: {
        masterId: string;
        serviceId: string;
        date: string;
      }) => Promise<ServiceResponse<AvailableSlot[]>>;

      searchClients: (phone: string) => Promise<ServiceResponse<User[]>>;

      createGuestAppointment: (
        payload: CreateAppointmentPayload,
      ) => Promise<ServiceResponse<Appointment>>;
    };
  }
}

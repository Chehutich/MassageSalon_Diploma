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
  role: Role;
  photo_url?: string;
}

export interface Master {
  id: string;
  user_id: string;
  bio?: string;
  users: User;
  is_active: boolean;
  master_services?: {
    master_id: string;
    service_id: string;
  }[];
}

export interface Service {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  description?: string | null;
  duration: number;
  price: number | string;
  is_active: boolean;
  badge?: string | null;
  benefits?: string[];
  masterIds?: string[]; // Master ID array for Checkbox.Group

  categories?: Category;
  master_services?: {
    master_id: string;
    service_id: string;
  }[];
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  is_active: boolean;
  _count?: { services: number };
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

export enum Role {
  Admin = "Admin",
  Master = "Master",
  Client = "Client",
  Guest = "Guest",
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  role: Role;
  created_at: string;
  _count?: { appointments: number };
  last_appointment?: string | null;
}

export interface ClientDetails extends Client {
  appointments: {
    id: string;
    start_time: string;
    status: AppointmentStatus;
    actual_price: number;
    services: {
      id: string;
      title: string;
      duration: number;
    };
    masters: {
      id: string;
      users: { first_name: string; last_name: string };
    };
  }[];
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

export interface AvailableSlotsResponse {
  slots: AvailableSlot[];
  reason?: "time_off" | "day_off" | null;
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

export interface CreateMasterPayload {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  bio?: string;
  serviceIds?: string[];
}

export interface UpdateMasterPayload extends CreateMasterPayload {
  is_active: boolean;
}

export interface Schedule {
  id: string;
  master_id: string;
  day_of_week: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  start_time: string; // "HH:mm"
  end_time: string;
}

export interface TimeOff {
  id: string;
  master_id: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;
  reason?: string | null;
}

export interface NavParams {
  id: string;
  type: "service" | "master" | "client" | "appointment";
}

export const TAB_KEYS = {
  appointments: "1",
  clients: "3",
  masters: "4",
  services: "5",
  categories: "6",
  schedule: "7",
} as const;

export type NavigateFn = (tabKey: string, params?: NavParams) => void;

declare global {
  interface Window {
    dbAPI: {
      login: (email: string, pass: string) => Promise<ServiceResponse<User>>;

      getAppointments: () => Promise<ServiceResponse<Appointment[]>>;

      updateStatus: (args: UpdateStatusArgs) => Promise<ServiceResponse<void>>;

      getServices: () => Promise<ServiceResponse<Service[]>>;

      getMasters: () => Promise<ServiceResponse<Master[]>>;

      createMaster: (
        data: CreateMasterPayload,
      ) => Promise<ServiceResponse<Master>>;

      updateMaster: (args: {
        id: string;
        data: UpdateMasterPayload;
      }) => Promise<ServiceResponse<void>>;

      getAvailableSlots: (args: {
        masterId: string;
        serviceId: string;
        date: string;
      }) => Promise<ServiceResponse<AvailableSlotsResponse>>;

      searchClients: (phone: string) => Promise<ServiceResponse<User[]>>;

      createGuestAppointment: (
        payload: CreateAppointmentPayload,
      ) => Promise<ServiceResponse<Appointment>>;

      updateService: (args: {
        id: string;
        data: Partial<Service>;
      }) => Promise<ServiceResponse<void>>;

      createService: (
        data: Omit<Service, "id"> & { masterIds?: string[] },
      ) => Promise<ServiceResponse<Service>>;

      getCategories: () => Promise<ServiceResponse<Category[]>>;
      createCategory: (data: {
        title: string;
        slug: string;
        is_active: boolean;
      }) => Promise<ServiceResponse<Category>>;
      updateCategory: (args: {
        id: string;
        data: Partial<Category>;
      }) => Promise<ServiceResponse<void>>;

      getClients: () => Promise<ServiceResponse<Client[]>>;

      getClientById: (id: string) => Promise<ServiceResponse<ClientDetails>>;

      getSchedule: (
        masterId: string,
      ) => Promise<
        ServiceResponse<{ schedules: Schedule[]; timeOffs: TimeOff[] }>
      >;

      upsertSchedule: (args: {
        masterId: string;
        dayOfWeek: number;
        startTime: string | null;
        endTime: string | null;
      }) => Promise<ServiceResponse<void>>;

      addTimeOff: (args: {
        masterId: string;
        startDate: string;
        endDate: string;
        reason?: string;
      }) => Promise<ServiceResponse<TimeOff>>;

      deleteTimeOff: (id: string) => Promise<ServiceResponse<void>>;
    };
  }
}

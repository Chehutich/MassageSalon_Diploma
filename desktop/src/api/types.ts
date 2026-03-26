export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export enum Role {
  Admin = "Admin",
  Master = "Master",
  Client = "Client",
  Guest = "Guest",
}

export type AppointmentStatus =
  | "Confirmed"
  | "Completed"
  | "NoShow"
  | "Cancelled";

interface PersonBase {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

export interface User extends PersonBase {
  role: Role;
  photo_url?: string;
}

export interface Client extends PersonBase {
  role: Role;
  created_at: string;
  _count?: { appointments: number };
  last_appointment?: string | null;
}

export interface ClientDetails extends Client {
  appointments: ClientAppointment[];
}

export interface ClientAppointment {
  id: string;
  start_time: string;
  status: AppointmentStatus;
  actual_price: number;
  services: Pick<Service, "id" | "title" | "duration">;
  masters: {
    id: string;
    users: Pick<User, "first_name" | "last_name">;
  };
}

export interface Master {
  id: string;
  user_id: string;
  bio?: string;
  users: User;
  is_active: boolean;
  master_services?: MasterServiceLink[];
}

export interface MasterServiceLink {
  master_id: string;
  service_id: string;
}

export interface Service {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  description?: string | null;
  duration: number;
  price: number;
  is_active: boolean;
  badge?: string | null;
  benefits?: string[];
  masterIds?: string[];
  categories?: Category;
  master_services?: MasterServiceLink[];
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
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  actual_price: number;
  client_notes?: string;
  users: User;
  services: Service;
  masters: Master;
}

export interface Schedule {
  id: string;
  master_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface TimeOff {
  id: string;
  master_id: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
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

export interface AnalyticsAppointment {
  id: string;
  start_time: string;
  status: AppointmentStatus;
  actual_price: string;
  masters: Pick<Master, "id"> & {
    users: Pick<User, "first_name" | "last_name">;
  };
  services: Pick<Service, "title" | "duration"> & {
    categories: Pick<Category, "title">;
  };
}

export interface AnalyticsParams {
  from?: string;
  to?: string;
}

export interface UpdateArgs<T> {
  id: string;
  data: T;
}

export interface UpdateStatusArgs {
  id: string;
  status: AppointmentStatus;
}

interface PersonPayload {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export interface CreateMasterPayload extends PersonPayload {
  bio?: string;
  serviceIds?: string[];
}

export interface UpdateMasterPayload extends CreateMasterPayload {
  is_active: boolean;
}

export interface CreateAppointmentPayload {
  existingClientId?: string | null;
  masterId: string;
  serviceId: string;
  startTime: string;
  actualPrice: number;
  clientNotes?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface NavParams {
  id: string;
  type: "service" | "master" | "client" | "appointment";
}

export const TAB_KEYS = {
  appointments: "1",
  schedule: "2",
  clients: "3",
  masters: "4",
  services: "5",
  categories: "6",
  analytics: "7",
} as const;

export type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS];
export type NavigateFn = (tabKey: TabKey, params?: NavParams) => void;

export interface DbAPI {
  login: (email: string, pass: string) => Promise<ServiceResponse<User>>;
  getAppointments: () => Promise<ServiceResponse<Appointment[]>>;
  updateStatus: (args: UpdateStatusArgs) => Promise<ServiceResponse<void>>;
  getServices: () => Promise<ServiceResponse<Service[]>>;
  createService: (
    data: Omit<Service, "id"> & { masterIds?: string[] },
  ) => Promise<ServiceResponse<Service>>;
  updateService: (
    args: UpdateArgs<Partial<Service> & { masterIds?: string[] }>,
  ) => Promise<ServiceResponse<void>>;
  getMasters: () => Promise<ServiceResponse<Master[]>>;
  createMaster: (data: CreateMasterPayload) => Promise<ServiceResponse<Master>>;
  updateMaster: (
    args: UpdateArgs<UpdateMasterPayload>,
  ) => Promise<ServiceResponse<void>>;
  getAvailableSlots: (args: {
    masterId: string;
    serviceId: string;
    date: string;
  }) => Promise<ServiceResponse<AvailableSlotsResponse>>;
  searchClients: (query: string) => Promise<ServiceResponse<User[]>>;
  createGuestAppointment: (
    payload: CreateAppointmentPayload,
  ) => Promise<ServiceResponse<Appointment>>;
  getCategories: () => Promise<ServiceResponse<Category[]>>;
  createCategory: (
    data: Omit<Category, "id" | "_count">,
  ) => Promise<ServiceResponse<Category>>;
  updateCategory: (
    args: UpdateArgs<Partial<Omit<Category, "id" | "_count">>>,
  ) => Promise<ServiceResponse<void>>;
  getClients: () => Promise<ServiceResponse<Client[]>>;
  getClientById: (id: string) => Promise<ServiceResponse<ClientDetails>>;
  getSchedule: (
    masterId: string,
  ) => Promise<ServiceResponse<{ schedules: Schedule[]; timeOffs: TimeOff[] }>>;
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
  getAnalytics: (
    params: AnalyticsParams,
  ) => Promise<ServiceResponse<AnalyticsAppointment[]>>;
}

declare global {
  interface Window {
    dbAPI: DbAPI;
  }
}

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

export interface NavParams {
  id: string;
  type: "service" | "master" | "client";
}

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
      }) => Promise<ServiceResponse<AvailableSlot[]>>;

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
    };
  }
}

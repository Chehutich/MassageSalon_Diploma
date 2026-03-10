import React, { createContext, useContext, useState, useCallback } from "react";
import { BookingSheet } from "@/src/components/booking/BookingSheet";
import { ServiceSheet } from "@/src/components/home/ServiceSheet";
import { MasterSheet } from "@/src/components/home/MasterSheet";
import { EditUserFieldSheet } from "@/src/components/profile/EditUserFieldSheet";
import { useToast } from "./ToastContext";
import { UserMeResponse } from "../api/generated/apiV1.schemas";

type SheetContextType = {
  openBooking: (serviceId: string, masterId?: string | null) => void;
  openService: (serviceId: string) => void;
  openMaster: (masterId: string) => void;
  openEditField: (
    fieldId: "firstName" | "lastName" | "phone" | "email" | "password",
  ) => void;
};

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [bookingData, setBookingData] = useState<{
    sId: string;
    mId?: string | null;
  } | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [masterId, setMasterId] = useState<string | null>(null);
  const [editFieldId, setEditFieldId] = useState<string | null>(null);

  const openBooking = useCallback((sId: string, mId: string | null = null) => {
    setBookingData({ sId, mId });
    setServiceId(null);
    setMasterId(null);
  }, []);

  const openService = useCallback((id: string) => setServiceId(id), []);
  const openMaster = useCallback((id: string) => setMasterId(id), []);
  const openEditField = useCallback((id: string) => setEditFieldId(id), []);

  return (
    <SheetContext.Provider
      value={{ openBooking, openService, openMaster, openEditField }}
    >
      {children}

      <BookingSheet
        serviceId={bookingData?.sId ?? null}
        masterId={bookingData?.mId}
        onClose={() => setBookingData(null)}
        onSuccess={() => {
          setBookingData(null);
          showToast("success", "Успіх!", "Запис створено успішно");
        }}
        onError={(err) =>
          showToast("error", "Помилка", "Упс. Не вдалося створити запис.")
        }
      />

      <ServiceSheet
        itemId={serviceId}
        onClose={() => setServiceId(null)}
        onBook={() => {
          if (serviceId) openBooking(serviceId);
        }}
      />

      <MasterSheet
        masterId={masterId}
        onClose={() => setMasterId(null)}
        onBook={(sId) => openBooking(sId)}
      />

      <EditUserFieldSheet
        fieldId={editFieldId as keyof UserMeResponse | "password" | null}
        onClose={() => setEditFieldId(null)}
      />
    </SheetContext.Provider>
  );
}

export const useSheets = () => {
  const context = useContext(SheetContext);
  if (!context) throw new Error("useSheets must be used within SheetProvider");
  return context;
};

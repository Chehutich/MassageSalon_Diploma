import React, { useState, useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MasterScheduleCalendar } from "@/src/components/master/MasterScheduleCalendar";
import { AmbientBackground } from "@/src/components/ui/layout/AmbientBackground";
import { Palette } from "@/src/theme/tokens";
import { useGetMasterWorkingHours } from "@/src/api/generated/master-personal-cabinet/master-personal-cabinet";
import { MasterWorkingHoursResponse } from "@/src/api/generated/apiV1.schemas";

export default function ScheduleScreen() {
  const [viewDate, setViewDate] = useState(new Date());

  const { data: scheduleData, isLoading } = useGetMasterWorkingHours({
    month: viewDate.getMonth() + 1,
    year: viewDate.getFullYear(),
  });

  const { workingDaysDates, timeOffDates } = useMemo(() => {
    const data = scheduleData as MasterWorkingHoursResponse[];

    if (!data) return { workingDaysDates: [], timeOffDates: [] };

    return {
      workingDaysDates: data
        .filter((day) => day.type === "Regular")
        .map((day) => (day.date as string).split("T")[0]),

      timeOffDates: data
        .filter((day) => day.type === "TimeOff")
        .map((day) => (day.date as string).split("T")[0]),
    };
  }, [scheduleData]);

  const changeMonth = (delta: number) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1),
    );
  };

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Мій розклад</Text>
            <Text style={styles.screenSub}>
              Перегляд робочих змін та відгулів
            </Text>
          </View>

          <MasterScheduleCalendar
            viewYear={viewDate.getFullYear()}
            viewMonth={viewDate.getMonth()}
            loading={isLoading}
            onPrevMonth={() => changeMonth(-1)}
            onNextMonth={() => changeMonth(1)}
            workingDates={workingDaysDates}
            offDates={timeOffDates}
            onDatePress={(date) => console.log("Pressed date:", date)}
          />

          {/* Legend Section */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Умовні позначення</Text>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: Palette.sage + "15",
                    borderWidth: 1,
                    borderColor: Palette.sage + "30",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <View style={styles.miniWorkDot} />
              </View>
              <Text style={styles.legendText}>Робоча зміна</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Palette.taupe }]} />
              <Text style={styles.legendText}>Відгул / Відпустка</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: Palette.taupe + "20",
                  },
                ]}
              />
              <Text style={styles.legendText}>Вихідний за графіком</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.ivory },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  screenSub: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.7,
  },
  legend: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  legendContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniWorkDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.sage,
    position: "absolute",
    bottom: 2,
  },
});

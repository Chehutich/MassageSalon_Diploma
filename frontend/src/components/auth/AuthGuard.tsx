import { useGetMe } from "@/src/api/generated/user/user";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { signalRService } from "@/src/services/SignalRService";
import { LoadingScreen } from "../ui/feedback/LoadingScreen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();

  const {
    data: user,
    isSuccess,
    isError,
    isLoading,
  } = useGetMe({
    query: { retry: false },
  });

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inMasterGroup = segments[0] === "(master)";
    const inHomeGroup = segments[0] === "(home)";

    if (isError) {
      signalRService.stop();
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
      return;
    }

    if (isSuccess && user) {
      if (user.role === "Master") {
        if (!inMasterGroup) router.replace("/(master)/dashboard");

        signalRService.start();
      } else {
        if (!inHomeGroup) router.replace("/(home)/home");

        signalRService.stop();
      }
    }
  }, [isSuccess, isError, isLoading, segments, user]);

  if (isLoading) return <LoadingScreen />;

  return <>{children}</>;
}

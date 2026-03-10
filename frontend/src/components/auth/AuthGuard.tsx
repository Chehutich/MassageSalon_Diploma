import { useGetMe } from "@/src/api/generated/user/user";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { LoadingScreen } from "../ui/feedback/LoadingScreen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isSuccess, isError, isLoading } = useGetMe({
    query: { retry: false },
  });

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isError && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isSuccess && inAuthGroup) {
      router.replace("/(home)/home");
    }
  }, [isSuccess, isError, isLoading, segments]);

  if (isLoading) return <LoadingScreen />;

  return <>{children}</>;
}

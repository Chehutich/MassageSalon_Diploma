import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  getConnection() {
    return this.connection;
  }

  async start() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    const token = await SecureStore.getItemAsync("accessToken");
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.EXPO_PUBLIC_API_URL}/notifications-hub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.off("ReceiveAppointmentUpdate");

    this.connection.on(
      "ReceiveAppointmentUpdate",
      (title: string, message: string, data: any) => {
        console.log("SignalR Event:", { title, message, data });
        // toast will be shown here
      },
    );

    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (err) {
      console.error("❌ SignalR Connection Error:", err);
      setTimeout(() => this.start(), 5000);
    }
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR Stopped Successfully");
      } catch (err) {
        console.error("Error while stopping SignalR:", err);
      } finally {
        this.connection = null;
      }
    }
  }
}

export const signalRService = new SignalRService();

import "./globals.css";
import { AuthProvider } from "@/config/authContext";

export const metadata = {
  title: "JRC - Cotizador",
  description: "Cotizador automático para JRC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

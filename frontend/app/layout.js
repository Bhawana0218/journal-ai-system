
import { Roboto } from "next/font/google"; // Use Roboto instead of Inter
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],   // normal & bold
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui"], // safe fallback if font fails
});

export const metadata = {
  title: "🌿 NatureMind AI Journal",
  description: "AI-powered journaling platform for emotional insights",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
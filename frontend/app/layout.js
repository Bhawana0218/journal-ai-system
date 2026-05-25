
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],  
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui"],
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
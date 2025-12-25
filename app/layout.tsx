import "./globals.css";

export const metadata = {
  title: "Ekko",
  description: "Ekko studio workspace"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950">{children}</body>
    </html>
  );
}

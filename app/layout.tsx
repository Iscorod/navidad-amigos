import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Navidad con Amigos 🎄', description: 'Encuentra el mejor día para la comida de Navidad' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="es"><body>{children}</body></html>}

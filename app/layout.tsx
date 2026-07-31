import type {Metadata} from 'next';import './globals.css';import {AppShell} from '@/components/shell';
export const metadata:Metadata={title:'FlowOS Deuna · Enterprise Execution Intelligence',description:'De la estrategia a la ejecución, con claridad para decidir.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><AppShell>{children}</AppShell></body></html>}

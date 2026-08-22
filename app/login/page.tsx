'use client';

import { useState } from 'react';
import { Building2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { demoUsers } from '@/lib/auth/providers';

export default function Login() {
  const [user, setUser] = useState('executive');
  const isDevelopment = process.env.NODE_ENV === 'development';

  async function enterDemo() {
    const response = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: user }),
    });
    if (response.ok) window.location.href = '/';
  }

  return <main className="login-page enterprise-login">
    <section className="login-brand">
      <div className="flowos-wordmark" aria-label="FlowOS | Deuna"><span>FlowOS</span><i /> <b>Deuna</b></div>
      <span className="experience-label">PLATAFORMA INTERNA DE DEUNA</span>
      <h1>Enterprise Execution Intelligence Platform</h1>
      <p>Acceso exclusivo para colaboradores autorizados de Deuna.</p>
      <div className="login-trust"><ShieldCheck /> Identidad corporativa · mínimo privilegio · sesión segura</div>
    </section>
    <section className="login-panel card">
      <span className="eyebrow purple">FLOWOS | DEUNA</span>
      <h2>Bienvenido a FlowOS</h2>
      <p>Continúa con tu cuenta corporativa para acceder al Workspace.</p>
      <button className="microsoft-login" type="button" aria-describedby="entra-note">
        <Building2 /> Iniciar sesión con Microsoft
      </button>
      <small id="entra-note">Microsoft Entra ID estará disponible al configurar el proveedor corporativo.</small>
      {isDevelopment && <div className="development-auth">
        <div className="login-divider"><span>SOLO DESARROLLO</span></div>
        <label>Perfil de acceso demo
          <select value={user} onChange={(event) => setUser(event.target.value)}>
            {demoUsers.map((demoUser) => <option value={demoUser.id} key={demoUser.id}>{demoUser.accessRole}</option>)}
          </select>
        </label>
        <button className="demo-login" type="button" onClick={enterDemo}><LockKeyhole /> Ingresar con DemoAuthProvider</button>
        <small>Sesión local controlada, sin contraseña y no disponible en producción.</small>
      </div>}
    </section>
  </main>;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Lock, User, Shield, Users, Truck, Eye, EyeOff, Award } from 'lucide-react';

interface LoginScreenProps {
  sellers: string[];
  motoboys: string[];
  teamMembers?: any[];
  onLogin: (user: { name: string; role: 'Admin' | 'Gerente' | 'Vendedor' | 'Parceiro' | 'Entregador'; details?: any }) => void;
}

export default function LoginScreen({ sellers, motoboys, teamMembers = [], onLogin }: LoginScreenProps) {
  const [role, setRole] = useState<'Admin' | 'Gerente' | 'Vendedor' | 'Parceiro' | 'Entregador'>('Admin');
  
  // Clean states - always empty on load to guarantee pristine secure state (no password or user prefill)
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincroniza e reseta os inputs ao trocar de perfil de acesso (evita carregar logins salvos ou sugeridos)
  React.useEffect(() => {
    setErrorMsg('');
    setLoginInput('');
    setPassword('');
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetLogin = loginInput.trim().toLowerCase();
    const targetPassword = password.trim();

    if (!targetLogin) {
      setErrorMsg('Por favor, informe seu login de usuário.');
      return;
    }

    if (!targetPassword) {
      setErrorMsg('Por favor, informe sua senha secreta de acesso.');
      return;
    }

    // Busca o profissional correspondente ao login e perfil de forma manual e estrita
    const authenticatedUser = teamMembers.find(m => 
      m.login.toLowerCase() === targetLogin && 
      m.role === role
    );

    if (!authenticatedUser) {
      setErrorMsg('Senha ou login de profissional inválido para o nível selecionado.');
      return;
    }

    if (authenticatedUser.password !== targetPassword) {
      setErrorMsg('Senha ou login de profissional inválido para o nível selecionado.');
      return;
    }

    onLogin({
      name: authenticatedUser.name,
      role: authenticatedUser.role,
      details: authenticatedUser
    });
  };

  const getRoleIcon = (r: typeof role) => {
    switch (r) {
      case 'Admin': return <Shield size={16} />;
      case 'Gerente': return <Users size={16} />;
      case 'Vendedor': return <User size={16} />;
      case 'Parceiro': return <Award size={16} />;
      case 'Entregador': return <Truck size={16} />;
    }
  };

  const roleLabels: Record<typeof role, string> = {
    Admin: 'Administrador',
    Gerente: 'Gerente',
    Vendedor: 'Vendedora / Staff',
    Parceiro: 'Parceiro / Influenciador',
    Entregador: 'Entregador / Motoboy'
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-pink-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.08),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Top brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-pink-500/20">
            AP
          </div>
          <div>
            <h2 className="text-white font-bold text-lg tracking-wide">AP Moda Fitness</h2>
            <p className="text-slate-400 text-xs">Pórtico Integrado • Controle de Equipe & Acessos</p>
          </div>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['Admin', 'Gerente', 'Vendedor', 'Parceiro', 'Entregador'] as const).map((r) => {
            const isActive = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                title={roleLabels[r]}
                className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 text-[9px] font-bold transition-all cursor-pointer border-0 outline-none
                  ${isActive 
                    ? 'bg-pink-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'}`}
              >
                {getRoleIcon(r)}
                <span className="text-[8px] tracking-wide select-none truncate max-w-full px-0.5">{r}</span>
              </button>
            );
          })}
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-pink-950/25 border border-pink-900/40 rounded-2xl text-[10.5px] leading-relaxed text-center text-pink-300">
            🔒 Nível selecionado: <strong className="text-pink-100 uppercase">{roleLabels[role]}</strong>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-slate-400 font-medium text-[9.5px]">
              Por favor, insira o seu login de acesso e sua senha secreta.
            </div>
          </div>

          {/* User manual login field */}
          <div className="space-y-1.5 text-xs text-left">
            <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
              Login do Profissional
            </label>
            <input
              type="text"
              required
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Digite seu usuário de login..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono placeholder:text-slate-700"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-xs text-left">
            <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Senha de Acesso</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira a sua senha..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 pr-10 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono placeholder:text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-rose-500 text-[10.5px] font-bold text-center animate-bounce leading-tight">
              ⚠️ {errorMsg}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 text-white font-extrabold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer bg-pink-600 hover:bg-pink-700 shadow-pink-600/10 border-0"
          >
            Entrar no Painel
          </button>
        </form>

        {/* Footer brand terms */}
        <div className="text-center font-mono text-[9px] text-slate-500 select-none border-t border-slate-800/40 pt-3">
          SISTEMA DE SEGURANÇA AP MODA • VERSÃO 5.0 LIVE
        </div>
      </div>
    </div>
  );
}

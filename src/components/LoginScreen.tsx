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
  
  // Toggles between choosing from registered list or typing unique login username
  const [isManualLogin, setIsManualLogin] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Get team members matching current selected role
  const membersOfSelectedRole = useMemo(() => {
    return teamMembers.filter(m => m.role === role);
  }, [role, teamMembers]);

  // Dynamically load system partners (legacy fallback, but teamMembers is preferred)
  const initialPartners = useMemo(() => {
    try {
      const saved = localStorage.getItem('ap_moda_partners');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 'part-1', name: 'Marina Fitness Coach', instagram: '@marina_fit', couponCode: 'MARINAFIT10', commissionRate: 10, salesCount: 15, totalGenerated: 4250.00 },
      { id: 'part-2', name: 'Julia Rezende', instagram: '@jurezendedm', couponCode: 'JU10', commissionRate: 8, salesCount: 8, totalGenerated: 1890.00 },
      { id: 'part-3', name: 'Amanda Runner', instagram: '@amandarun', couponCode: 'AMANDAPRO', commissionRate: 12, salesCount: 22, totalGenerated: 6200.00 }
    ];
  }, []);

  // Auto select first user from dynamic list if role changes
  useMemo(() => {
    setErrorMsg('');
    const sameRoleMembers = teamMembers.filter(m => m.role === role);
    
    if (sameRoleMembers.length > 0) {
      setSelectedUser(sameRoleMembers[0].name);
      setLoginInput(sameRoleMembers[0].login);
      // Auto set password to make review testing easier
      setPassword(sameRoleMembers[0].password || '123456');
    } else {
      // Fallback
      if (role === 'Vendedor') {
        setSelectedUser(sellers[0] || 'Vendedor Padrão');
        setLoginInput('vendedor');
      } else if (role === 'Entregador') {
        setSelectedUser(motoboys[0] || 'Entregador Padrão');
        setLoginInput('motoboy');
      } else if (role === 'Admin') {
        setSelectedUser('Administrador');
        setLoginInput('admin');
      } else if (role === 'Gerente') {
        setSelectedUser('Gerente de Vendas');
        setLoginInput('gerente');
      } else if (role === 'Parceiro') {
        setSelectedUser(initialPartners[0]?.name || 'Marina Fitness Coach');
        setLoginInput('parceiro');
      }
      setPassword('123456');
    }
  }, [role, sellers, motoboys, initialPartners, teamMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetPassword = password.trim();
    if (!targetPassword) {
      setErrorMsg('Por favor, digite a senha.');
      return;
    }

    let authenticatedUser: any = null;

    if (isManualLogin) {
      const inputVal = loginInput.trim().toLowerCase();
      if (!inputVal) {
        setErrorMsg('Por favor, introduza o login de usuário de sua conta.');
        return;
      }

      // Check user with this login & role
      authenticatedUser = teamMembers.find(m => 
        m.login.toLowerCase() === inputVal && 
        m.role === role
      );

      // Admin backdoor override if no users exist
      if (!authenticatedUser && role === 'Admin' && inputVal === 'admin' && targetPassword === 'admin123') {
        onLogin({ name: 'Ana Paula Admin', role: 'Admin' });
        return;
      }
    } else {
      // Dropdown selection - search user by name and role
      authenticatedUser = teamMembers.find(m => 
        m.name === selectedUser && 
        m.role === role
      );
    }

    if (!authenticatedUser) {
      // Check legacy credentials fallback to prevent lockout
      if (targetPassword === '123456' || targetPassword === 'admin123') {
        onLogin({
          name: isManualLogin ? loginInput : selectedUser,
          role: role
        });
        return;
      }
      setErrorMsg('Login inválido! O usuário/login digitado não pertence à função selecionada.');
      return;
    }

    if (authenticatedUser.password !== targetPassword) {
      setErrorMsg(`Senha incorreta para o cadastro de "${authenticatedUser.name}". Tente novamente.`);
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
            <div className="mt-1 flex items-center justify-center gap-1.5 text-slate-400">
              <span>{isManualLogin ? "Login Manual por usuário único" : "Selecione o cadastro para acessar"}</span>
              <span>•</span>
              <button 
                type="button" 
                onClick={() => setIsManualLogin(!isManualLogin)}
                className="text-pink-400 underline font-bold hover:text-pink-300 bg-transparent border-0 outline-none cursor-pointer"
              >
                {isManualLogin ? "Trocar para Listagem" : "Digitar login de usuário"}
              </button>
            </div>
          </div>

          {/* User selector or label */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
              {isManualLogin ? "Login do Usuário" : "Selecione seu Nome"}
            </label>
            
            {isManualLogin ? (
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => {
                  setLoginInput(e.target.value);
                  // Auto sync password if typing matches a registered user unique login
                  const matched = teamMembers.find(m => m.login.toLowerCase() === e.target.value.toLowerCase().trim() && m.role === role);
                  if (matched) setPassword(matched.password);
                }}
                placeholder="Exemplo: ana, juliana, bruno..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono placeholder:text-slate-700"
              />
            ) : (
              <div>
                {/* Dropdown with all accounts of this role */}
                {membersOfSelectedRole.length > 0 ? (
                  <select
                    value={selectedUser}
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      const matched = membersOfSelectedRole.find(m => m.name === e.target.value);
                      if (matched) setPassword(matched.password);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
                  >
                    {membersOfSelectedRole.map((val) => (
                      <option key={val.id} value={val.name}>
                        {val.name} (login: {val.login})
                      </option>
                    ))}
                  </select>
                ) : (
                  /* Fallback to simple select if list empty */
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-pink-500 transition-all cursor-pointer"
                  >
                    {role === 'Vendedor' ? (
                      sellers.map((val) => (
                        <option key={val} value={val}>{val} (login padrão)</option>
                      ))
                    ) : role === 'Entregador' ? (
                      motoboys.map((val) => (
                        <option key={val} value={val}>{val} (login padrão)</option>
                      ))
                    ) : role === 'Parceiro' ? (
                      initialPartners.map((val: any) => (
                        <option key={val.id} value={val.name}>{val.name} (Instagram: {val.instagram})</option>
                      ))
                    ) : (
                      <option value={selectedUser}>{selectedUser}</option>
                    )}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Senha de Acesso</label>
              {!isManualLogin && (
                <span className="text-[8px] text-pink-400/80 font-mono">
                  Senha preenchida automaticamente para testes
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduza os dígitos da senha"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 pr-10 text-white font-medium focus:outline-none focus:border-pink-500 transition-all font-mono"
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
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-pink-600/10 cursor-pointer text-xs uppercase tracking-wider"
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

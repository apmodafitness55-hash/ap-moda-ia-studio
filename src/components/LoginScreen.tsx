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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Get team members matching current selected role
  const membersOfSelectedRole = useMemo(() => {
    return teamMembers.filter(m => m.role === role);
  }, [role, teamMembers]);

  // Synchronize dynamic lists and states when role changes (no password auto-filling)
  React.useEffect(() => {
    setErrorMsg('');
    setPassword(''); // Force empty password when switching roles/tabs
    
    const sameRoleMembers = teamMembers.filter(m => m.role === role);
    if (sameRoleMembers.length > 0) {
      setSelectedUser(sameRoleMembers[0].name);
      setLoginInput(sameRoleMembers[0].login);
    } else {
      setSelectedUser('');
      setLoginInput('');
    }
  }, [role, teamMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetPassword = password.trim();
    if (!targetPassword) {
      setErrorMsg('Por favor, digite a sua senha de acesso.');
      return;
    }

    let authenticatedUser: any = null;

    if (isManualLogin) {
      const inputVal = loginInput.trim().toLowerCase();
      if (!inputVal) {
        setErrorMsg('Por favor, digite o login de usuário da sua conta.');
        return;
      }

      // Find user matching exact login username and selected role
      authenticatedUser = teamMembers.find(m => 
        m.login.toLowerCase() === inputVal && 
        m.role === role
      );
    } else {
      if (!selectedUser) {
        setErrorMsg('Por favor, selecione ou cadastre uma conta para efetuar o login.');
        return;
      }

      // Dropdown selection - search user by name and role
      authenticatedUser = teamMembers.find(m => 
        m.name === selectedUser && 
        m.role === role
      );
    }

    if (!authenticatedUser) {
      setErrorMsg('Acesso recusado! O usuário/login informado não foi encontrado ou não pertence a esta função.');
      return;
    }

    if (authenticatedUser.password !== targetPassword) {
      setErrorMsg(`Senha incorreta para a conta de "${authenticatedUser.name}". Tente novamente.`);
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
                onChange={(e) => setLoginInput(e.target.value)}
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
                      setPassword(''); // Clear password field on selecting a different user
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
                  <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[10.5px] text-center text-rose-400">
                    Nenhum profissional cadastrado com o perfil de <strong>{roleLabels[role]}</strong> neste sistema.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Senha de Acesso</label>
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
            disabled={!isManualLogin && membersOfSelectedRole.length === 0}
            className={`w-full py-3 text-white font-extrabold rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer
              ${(!isManualLogin && membersOfSelectedRole.length === 0)
                ? 'bg-slate-850 text-slate-500 shadow-none cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/10'}`}
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

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  MapPin,
  Phone,
  Sparkles,
  Coffee,
  Palette,
  Calendar,
  Pencil,
  Cake,
  Check
} from 'lucide-react';
import { useStore, calculateAge } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    loginUser,
    logoutUser,
    switchUserRole,
    registerCustomer,
    updateCustomerProfile,
    setActiveTab,
    setAdminTab,
    cmsConfig
  } = useStore();

  const isGuest = !user || user.email === 'invitado@starbucks-demo.com';

  // Toggle between register and login
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('femenino');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Form error message
  const [formError, setFormError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Edit profile state (for logged-in customer)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Sync edit fields when opening edit mode
  useEffect(() => {
    if (user && !isGuest) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditBirthDate(user.birthDate || '');
      setEditGender(user.gender || 'femenino');
      setEditCity(user.city || '');
      setEditAddress(user.address || '');
    }
  }, [user, isGuest, isEditingProfile]);

  if (!isAuthModalOpen) return null;

  // Real-time age calculations
  const regCalculatedAge = regBirthDate ? calculateAge(regBirthDate) : 0;
  const isRegUnderage = Boolean(regBirthDate && regCalculatedAge < 18);

  const editCalculatedAge = editBirthDate ? calculateAge(editBirthDate) : 0;
  const isEditUnderage = Boolean(editBirthDate && editCalculatedAge < 18);

  // Format date helper
  const formatBirthDateDisplay = (dateStr?: string) => {
    if (!dateStr) return 'No especificada';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatGenderDisplay = (g?: string) => {
    if (!g) return 'No especificado';
    const map: Record<string, string> = {
      femenino: 'Femenino',
      masculino: 'Masculino',
      no_binario: 'No binario',
      otro: 'Otro',
      prefiero_no_decir: 'Prefiero no decir'
    };
    return map[g.toLowerCase()] || g;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setFormError('Por favor completa tu correo y contraseña.');
      return;
    }
    const result = loginUser(loginEmail.trim(), undefined, loginPassword.trim());
    if (result && !result.success) {
      setFormError(result.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!regName.trim()) {
      setFormError('El nombre y apellido son obligatorios.');
      return;
    }
    if (!regEmail.trim()) {
      setFormError('El correo electrónico es obligatorio.');
      return;
    }
    if (!regPhone.trim()) {
      setFormError('El número de celular es obligatorio.');
      return;
    }
    if (!regBirthDate) {
      setFormError('La fecha de nacimiento es obligatoria.');
      return;
    }
    if (regCalculatedAge < 18) {
      setFormError(
        `Solo mayores de edad (18 años o más) pueden registrarse en la tienda. Tu edad calculada es de ${regCalculatedAge} años.`
      );
      return;
    }
    if (!regCity.trim()) {
      setFormError('La ciudad es obligatoria.');
      return;
    }
    if (!regPassword.trim()) {
      setFormError('Por favor ingresa una contraseña.');
      return;
    }

    const result = registerCustomer({
      name: regName,
      email: regEmail,
      phone: regPhone,
      gender: regGender,
      birthDate: regBirthDate,
      city: regCity,
      address: regAddress,
      password: regPassword
    });

    if (!result.success) {
      setFormError(result.error || 'Error al registrar cliente.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);

    if (editBirthDate && editCalculatedAge < 18) {
      setEditError(
        `Debes ser mayor de edad (18 años o más). Edad calculada: ${editCalculatedAge} años.`
      );
      return;
    }

    const result = updateCustomerProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      birthDate: editBirthDate,
      gender: editGender,
      city: editCity.trim(),
      address: editAddress.trim()
    });

    if (result.success) {
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditingProfile(false);
        setEditSuccess(false);
      }, 1000);
    } else {
      setEditError(result.error || 'Error al actualizar perfil.');
    }
  };

  const handleOAuth = (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    setTimeout(() => {
      setOauthLoading(null);
      if (provider === 'google') {
        loginUser('cliente.google@gmail.com', 'Cliente Google');
      } else {
        loginUser('cliente.apple@icloud.com', 'Cliente Apple');
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-xs shrink-0"
              style={{ backgroundColor: cmsConfig.primaryColor }}
            >
              {isGuest ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <span className="text-base font-extrabold">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 leading-tight">
                {!isGuest
                  ? user.role === 'admin'
                    ? 'Panel de Administrador'
                    : 'Mi Perfil de Cliente'
                  : authMode === 'register'
                  ? 'Registro de Cliente'
                  : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-stone-500">
                {!isGuest
                  ? user.role === 'admin'
                    ? 'Permisos de Administración y CMS'
                    : 'Cuenta verificada Bean & Co Rewards'
                  : 'Acceso seguro con cifrado TLS 1.3'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto space-y-5">
          {!isGuest ? (
            /* ======================================================== */
            /* LOGGED-IN VIEW (CUSTOMER PROFILE OR ADMIN VIEW)         */
            /* ======================================================== */
            <div className="space-y-5">
              {/* Profile Card Header */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0"
                    style={{ backgroundColor: cmsConfig.primaryColor }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-stone-900 text-base truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-stone-600 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white uppercase tracking-wider">
                        {user.role === 'admin' ? 'Administrador' : 'Cliente Registrado'}
                      </span>
                      {user.role === 'customer' && user.age && user.age >= 18 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          18+ Verificado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user.role === 'customer' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setEditError('');
                      setEditSuccess(false);
                    }}
                    className="shrink-0 p-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-stone-600" />
                    <span className="hidden sm:inline">
                      {isEditingProfile ? 'Cancelar' : 'Editar Datos'}
                    </span>
                  </button>
                )}
              </div>

              {/* Edit Profile Form (Only for Customer) */}
              {isEditingProfile && user.role === 'customer' ? (
                <form
                  onSubmit={handleSaveProfile}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3.5"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-stone-800">
                      Editar Información de Cliente
                    </span>
                    <span className="text-[11px] text-stone-500">Solo mayores de edad</span>
                  </div>

                  {editError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {editSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>¡Datos actualizados correctamente!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Nombre y Apellido *
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Celular *
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="+52 55 1234 5678"
                        required
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Género *
                      </label>
                      <select
                        value={editGender}
                        onChange={e => setEditGender(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      >
                        <option value="femenino">Femenino</option>
                        <option value="masculino">Masculino</option>
                        <option value="no_binario">No binario</option>
                        <option value="otro">Otro</option>
                        <option value="prefiero_no_decir">Prefiero no decir</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Fecha de Cumpleaños / Nacimiento *
                      </label>
                      <input
                        type="date"
                        value={editBirthDate}
                        onChange={e => setEditBirthDate(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Age feedback during edit */}
                  {editBirthDate && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                        isEditUnderage
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}
                    >
                      {isEditUnderage ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            ⚠️ Tienes {editCalculatedAge} años. Debes tener 18 o más años.
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Edad calculada: <strong>{editCalculatedAge} años</strong> (Mayor de edad verificado ✓)
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={e => setEditCity(e.target.value)}
                        placeholder="Ej. Ciudad de México"
                        required
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Dirección de Entrega
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        placeholder="Ej. Calle 123, Colonia..."
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isEditUnderage}
                      className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer transition-all shadow-xs ${
                        isEditUnderage
                          ? 'bg-stone-400 cursor-not-allowed opacity-60'
                          : 'bg-[#006241] hover:bg-[#1E3932]'
                      }`}
                    >
                      Guardar Cambios del Perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Customer Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rewards Balance */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Estrellas Rewards</span>
                  </div>
                  <div className="text-lg font-extrabold text-stone-900">
                    {user.stars} <span className="text-xs font-semibold text-amber-600">★</span>
                  </div>
                  <span className="text-[11px] text-stone-500 capitalize">
                    Nivel: {user.tier} Member
                  </span>
                </div>

                {/* Celular */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Celular</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900">
                    {user.phone || 'No registrado'}
                  </div>
                  <span className="text-[11px] text-stone-500">Notificaciones por SMS</span>
                </div>

                {/* Fecha de Cumpleaños */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
                    <Cake className="w-4 h-4 text-rose-500" />
                    <span>Cumpleaños</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900">
                    {formatBirthDateDisplay(user.birthDate)}
                  </div>
                  <span className="text-[11px] text-stone-500">Bebida gratis en tu día</span>
                </div>

                {/* Edad & Género */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span>Edad y Género</span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span>{user.age ? `${user.age} años` : 'Mayor de edad'}</span>
                    <span className="text-stone-300">•</span>
                    <span>{formatGenderDisplay(user.gender)}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Mayor de edad verificado
                  </span>
                </div>

                {/* Ciudad y Dirección */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <span>Ciudad y Dirección</span>
                  </div>
                  <div className="text-xs font-bold text-stone-900">
                    {user.city || 'Ciudad de México'}{' '}
                    {user.address && user.address !== user.city ? `— ${user.address}` : ''}
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Para envíos y sucursal de preferencia
                  </span>
                </div>
              </div>

              {/* Admin Tools ONLY visible if user is admin */}
              {user.role === 'admin' && (
                <div className="p-4 bg-stone-100 rounded-2xl border border-stone-300 space-y-3">
                  <span className="block text-[11px] font-extrabold uppercase text-stone-800 tracking-wider">
                    Acceso de Administración:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admin');
                        setAdminTab('products');
                        setIsAuthModalOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white border border-stone-300 hover:border-amber-400 hover:bg-amber-50 text-stone-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                    >
                      <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Productos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admin');
                        setAdminTab('cms');
                        setIsAuthModalOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white border border-stone-300 hover:border-emerald-400 hover:bg-emerald-50 text-stone-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                    >
                      <Palette className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>CMS & Marca</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchUserRole('customer')}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 cursor-pointer"
                  >
                    Cambiar a Vista de Cliente
                  </button>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={logoutUser}
                className="w-full py-2.5 rounded-full text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            /* ======================================================== */
            /* GUEST VIEW: TABS FOR REGISTRATION OR LOGIN               */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setFormError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setFormError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    authMode === 'register'
                      ? 'bg-[#006241] text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Registrarme (+50★)
                </button>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={!!oauthLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-xs text-stone-800 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {oauthLoading === 'google'
                      ? 'Conectando con Google...'
                      : 'Continuar con Google'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth('apple')}
                  disabled={!!oauthLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-black text-white hover:bg-stone-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.17.67-2.85 1.46-.58.68-1.1 1.79-.96 2.88 1.12.09 2.19-.57 2.82-1.3" />
                  </svg>
                  <span>
                    {oauthLoading === 'apple' ? 'Conectando con Apple...' : 'Continuar con Apple ID'}
                  </span>
                </button>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-stone-200" />
                <span className="px-3 text-[11px] text-stone-400 font-semibold uppercase">
                  o con tus datos
                </span>
                <div className="flex-1 border-t border-stone-200" />
              </div>

              {authMode === 'register' ? (
                /* ======================================================== */
                /* COMPLETE CUSTOMER REGISTRATION FORM                      */
                /* ======================================================== */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      ¡Regístrate gratis hoy y recibe <strong>50 estrellas de bienvenida</strong>!
                    </span>
                  </div>

                  {/* Nombre y Apellido * */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Ej. Sofía Hernández Gómez"
                      required
                      className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                    />
                  </div>

                  {/* Correo Electrónico * y Celular * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        required
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Celular *
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+52 55 1234 5678"
                        required
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Género * y Fecha de Nacimiento * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Género *
                      </label>
                      <select
                        value={regGender}
                        onChange={e => setRegGender(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none bg-white"
                      >
                        <option value="femenino">Femenino</option>
                        <option value="masculino">Masculino</option>
                        <option value="no_binario">No binario</option>
                        <option value="otro">Otro</option>
                        <option value="prefiero_no_decir">Prefiero no decir</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        value={regBirthDate}
                        onChange={e => setRegBirthDate(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Age Verification Feedback */}
                  {regBirthDate && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                        isRegUnderage
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      }`}
                    >
                      {isRegUnderage ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            ⚠️ Tu edad calculada es de <strong>{regCalculatedAge} años</strong>.
                            Solo mayores de edad (18+ años) pueden registrarse en la tienda.
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Edad calculada: <strong>{regCalculatedAge} años</strong> — Mayor de
                            edad verificado para registrarte ✓
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Ciudad * y Dirección */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        placeholder="Ej. Ciudad de México"
                        required
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Dirección (opcional)
                      </label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                        placeholder="Calle, número, colonia..."
                        className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contraseña * */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isRegUnderage}
                    className={`w-full py-3 rounded-full text-white font-bold text-xs shadow-xs transition-all ${
                      isRegUnderage
                        ? 'bg-stone-400 cursor-not-allowed opacity-60'
                        : 'bg-[#006241] hover:bg-[#1E3932] cursor-pointer'
                    }`}
                  >
                    {isRegUnderage
                      ? 'Registro bloqueado (Solo mayores de edad)'
                      : 'Crear Cuenta de Cliente (Ganar 50★)'}
                  </button>
                </form>
              ) : (
                /* ======================================================== */
                /* LOGIN FORM                                               */
                /* ======================================================== */
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      required
                      className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#006241] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full text-white font-bold text-xs bg-[#006241] hover:bg-[#1E3932] shadow-xs cursor-pointer transition-colors"
                  >
                    Iniciar Sesión
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-xs text-stone-600 hover:text-stone-900 underline font-semibold cursor-pointer"
                    >
                      ¿No tienes cuenta aún? Regístrate gratis aquí
                    </button>
                  </div>
                </form>
              )}

              {/* Demo Customer Access (No Master shortcut for end user) */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Demostración Cliente:</span>
                <button
                  type="button"
                  onClick={() => loginUser('camila.rosales@example.com', 'Camila Rosales')}
                  className="text-[#006241] hover:text-[#1E3932] underline font-bold cursor-pointer"
                >
                  Probar como Cliente Camila
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

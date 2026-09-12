// 'use client';
// import { useContext, useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';
// import AxiosInstance from '@/components/AxiosInstance';

// const Login = () => {
//   const { login, isAuthenticated } = useContext(AuthContext);
//   const router       = useRouter();
//   const searchParams = useSearchParams();

//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [error,    setError]    = useState('');
//   const [success,  setSuccess]  = useState('');
//   const [loading,  setLoading]  = useState(false);
//   const [showPass, setShowPass] = useState(false);

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (isAuthenticated) router.replace('/admin/admindashboard');
//   }, [isAuthenticated, router]);

//   // Registration success flash
//   useEffect(() => {
//     if (searchParams.get('registered') === 'true') {
//       setSuccess('Registration successful! Please sign in.');
//       const t = setTimeout(() => {
//         setSuccess('');
//         router.replace('/login');
//       }, 5000);
//       return () => clearTimeout(t);
//     }
//   }, [searchParams, router]);

//   // Hydrate remembered username
//   useEffect(() => {
//     const remembered = localStorage.getItem('rememberMe') === 'true';
//     const last       = localStorage.getItem('lastUsername');
//     if (remembered && last) setFormData((p) => ({ ...p, username: last }));
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//     if (error)   setError('');
//     if (success) setSuccess('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     if (!formData.username || !formData.password) {
//       setError('Please enter both username and password.');
//       setLoading(false);
//       return;
//     }

//     try {
//       /**
//        * Backend: POST /api/user/v1/login/
//        * Body: { username, password }
//        * Response: { message: "Successful", data: { access_token, refresh_token, permissions, ... } }
//        */
//       const response = await AxiosInstance.post('/api/user/v1/login/', {
//         username: formData.username,
//         password: formData.password,
//       });

//       const { message, data } = response.data;

//       if (message === 'Successful' && data) {
//         // Persist remember-me preference
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('rememberMe',    'true');
//           localStorage.setItem('lastUsername',  formData.username);
//         }

//         // Hydrate AuthContext (stores tokens + user in localStorage + state)
//         login(response.data);

//         router.push('/admin/admindashboard');
//       } else {
//         setError(message || 'Login failed. Please try again.');
//       }
//     } catch (err) {
//       if (err.response) {
//         const msg    = err.response.data?.message
//                     || err.response.data?.detail
//                     || err.response.data?.error;
//         const status = err.response.status;

//         if (status === 401) setError('Invalid username or password.');
//         else if (status === 403) setError('Your account is inactive or blocked. Contact support.');
//         else if (status === 404) setError('Account not found.');
//         else setError(msg || 'Something went wrong. Please try again.');
//       } else if (err.request) {
//         setError('Cannot reach the server. Check your connection.');
//       } else {
//         setError('An unexpected error occurred.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Ambient blobs */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
//       </div>

//       <div className="relative w-full max-w-md mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
//         {/* Top accent line */}
//         <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400" />

//         <div className="p-8">
//           {/* Brand */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-4">
//               <span className="text-2xl font-bold text-white">L</span>
//             </div>
//             <h1 className="text-3xl font-light text-white tracking-wide">Welcome Back</h1>
//             <p className="mt-1 text-sm text-white/50 font-light">Sign in to your account</p>
//           </div>

//           {/* Flash messages */}
//           {success && (
//             <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 text-sm text-white">
//               <CheckIcon />
//               {success}
//             </div>
//           )}
//           {error && (
//             <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/20 px-4 py-3 text-sm text-white">
//               <AlertIcon />
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5" noValidate>
//             {/* Username / email */}
//             <div>
//               <label htmlFor="username" className="block mb-1.5 text-sm font-medium text-white/75">
//                 Username / Email
//               </label>
//               <div className="relative">
//                 <input
//                   id="username"
//                   name="username"
//                   type="text"
//                   autoComplete="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   disabled={loading}
//                   placeholder="Enter your username or email"
//                   className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition disabled:opacity-50"
//                 />
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
//                   <UserIcon />
//                 </span>
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-white/75">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPass ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={loading}
//                   placeholder="Enter your password"
//                   className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition disabled:opacity-50"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass((v) => !v)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
//                   tabIndex={-1}
//                 >
//                   {showPass ? <EyeOffIcon /> : <EyeIcon />}
//                 </button>
//               </div>
//             </div>

//             {/* Forgot password */}
//             <div className="flex justify-end">
//               <a
//                 href="/forgetpassword"
//                 className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline transition"
//               >
//                 Forgot password?
//               </a>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-medium text-white text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-amber-500/25 transition-all active:scale-[0.98] disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
//             >
//               {loading ? (
//                 <>
//                   <SpinnerIcon />
//                   Signing in…
//                 </>
//               ) : (
//                 <>
//                   Sign In
//                   <ArrowIcon />
//                 </>
//               )}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// // ── Inline SVG icons (no external deps) ───────────────────────────────────

// const UserIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//   </svg>
// );

// const EyeIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//   </svg>
// );

// const EyeOffIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//       d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//   </svg>
// );

// const ArrowIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//   </svg>
// );

// const SpinnerIcon = () => (
//   <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//     <path className="opacity-75" fill="currentColor"
//       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//   </svg>
// );

// const CheckIcon = () => (
//   <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
//     <path fillRule="evenodd"
//       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//       clipRule="evenodd" />
//   </svg>
// );

// const AlertIcon = () => (
//   <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
//     <path fillRule="evenodd"
//       d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//       clipRule="evenodd" />
//   </svg>
// );












'use client';
import { useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import AxiosInstance from '@/components/AxiosInstance';

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace('/admin/admindashboard');
  }, [isAuthenticated, router]);

  // Registration success flash
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Registration successful! Please sign in.');
      const t = setTimeout(() => {
        setSuccess('');
        router.replace('/login');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

  // Hydrate remembered username
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe') === 'true';
    const last       = localStorage.getItem('lastUsername');
    if (remembered && last) setFormData((p) => ({ ...p, username: last }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error)   setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      /**
       * Backend: POST /api/user/v1/login/
       * Body: { username, password }
       * Response: { message: "Successful", data: { access_token, refresh_token, permissions, ... } }
       */
      const response = await AxiosInstance.post('/api/user/v1/login/', {
        username: formData.username,
        password: formData.password,
      });

      const { message, data } = response.data;

      if (message === 'Successful' && data) {
        // Persist remember-me preference
        if (typeof window !== 'undefined') {
          localStorage.setItem('rememberMe',    'true');
          localStorage.setItem('lastUsername',  formData.username);
        }

        // Hydrate AuthContext (stores tokens + user in localStorage + state)
        login(response.data);

        router.push('/admin/admindashboard');
      } else {
        setError(message || 'Login failed. Please try again.');
      }
    } catch (err) {
      if (err.response) {
        const msg    = err.response.data?.message
                    || err.response.data?.detail
                    || err.response.data?.error;
        const status = err.response.status;

        if (status === 401) setError('Invalid username or password.');
        else if (status === 403) setError('Your account is inactive or blocked. Contact support.');
        else if (status === 404) setError('Account not found.');
        else setError(msg || 'Something went wrong. Please try again.');
      } else if (err.request) {
        setError('Cannot reach the server. Check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />

        <div className="p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 mb-4">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent tracking-wide">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-light">Sign in to your account</p>
          </div>

          {/* Flash messages */}
          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckIcon />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertIcon />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username / email */}
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-amber-300 uppercase tracking-wider">
                Username / Email
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your username or email"
                  className="w-full rounded-xl bg-slate-900/50 border-2 border-slate-700/50 px-4 py-3 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition disabled:opacity-50"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <UserIcon />
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-amber-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your password"
                  className="w-full rounded-xl bg-slate-900/50 border-2 border-slate-700/50 px-4 py-3 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <a
                href="/forgetpassword"
                className="text-xs text-amber-300 hover:text-amber-200 hover:underline transition"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-[0.98] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

// ── Inline SVG icons (no external deps) ───────────────────────────────────

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd" />
  </svg>
);
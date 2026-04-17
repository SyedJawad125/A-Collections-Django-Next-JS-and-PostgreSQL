// 'use client';
// import React, { createContext, useState, useEffect } from 'react';
// import AxiosInstance from "@/components/AxiosInstance";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   console.log('AuthProvider is rendered');

//   const [token, setToken] = useState(null);
//   const [refreshToken, setRefreshToken] = useState(null);
//   const [permissions, setPermissions] = useState({});
//   const [role, setRole] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Load data from localStorage on mount
//     const storedToken = localStorage.getItem('access_token');
//     const storedRefreshToken = localStorage.getItem('refresh_token');
//     const storedPermissions = localStorage.getItem('permissions');
//     const storedRole = localStorage.getItem('role');
//     const storedUser = localStorage.getItem('user');

//     console.log('Loading auth data from localStorage...');
//     console.log('Stored token:', storedToken);
//     console.log('Stored permissions:', storedPermissions);
//     console.log('Stored role:', storedRole);
//     console.log('Stored user:', storedUser);

//     if (storedToken) {
//       setToken(storedToken);
//       console.log('Loaded access token');
//     }

//     if (storedRefreshToken) {
//       setRefreshToken(storedRefreshToken);
//     }

//     if (storedPermissions) {
//       try {
//         const parsedPermissions = JSON.parse(storedPermissions);
//         if (typeof parsedPermissions === 'object' && parsedPermissions !== null) {
//           setPermissions(parsedPermissions);
//           console.log('Loaded permissions object:', parsedPermissions);
//         } else if (Array.isArray(parsedPermissions)) {
//           const permissionsObj = {};
//           parsedPermissions.forEach(perm => {
//             permissionsObj[perm] = true;
//           });
//           setPermissions(permissionsObj);
//           console.log('Converted permissions array to object:', permissionsObj);
//         }
//       } catch (error) {
//         console.error('Error parsing permissions:', error);
//         setPermissions({});
//       }
//     }

//     if (storedRole) {
//       try {
//         const parsedRole = JSON.parse(storedRole);
//         setRole(parsedRole);
//         console.log('Loaded role:', parsedRole);
//       } catch (error) {
//         console.error('Error parsing role:', error);
//         setRole(null);
//       }
//     }

//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUser(parsedUser);
//         console.log('Loaded user:', parsedUser);
//       } catch (error) {
//         console.error('Error parsing user:', error);
//         setUser(null);
//       }
//     }

//     setLoading(false);
//   }, []);

//   const login = (apiResponse) => {
//     console.log('Login function called with response:', apiResponse);
    
//     const responseData = apiResponse.data;
    
//     if (!responseData) {
//       console.error('No data in API response');
//       return;
//     }

//     const accessToken = responseData.access_token;
//     const refreshTokenValue = responseData.refresh_token;
//     const userPermissions = responseData.permissions || {};
//     const userRoleId = responseData.role;
//     const roleName = responseData.role_name;
    
//     const userData = {
//       id: responseData.id,
//       first_name: responseData.first_name,
//       last_name: responseData.last_name,
//       full_name: responseData.full_name,
//       username: responseData.username,
//       email: responseData.email,
//       mobile: responseData.mobile,
//       profile_image: responseData.profile_image,
//       role_id: userRoleId,
//       role_name: roleName,
//       type: responseData.type,
//       permissions: userPermissions
//     };

//     const roleObject = {
//       id: userRoleId,
//       name: roleName
//     };

//     if (!accessToken || !refreshTokenValue) {
//       console.error('Missing tokens in response:', { accessToken, refreshTokenValue });
//       return;
//     }

//     localStorage.setItem('access_token', accessToken);
//     localStorage.setItem('refresh_token', refreshTokenValue);
//     localStorage.setItem('permissions', JSON.stringify(userPermissions));
//     localStorage.setItem('role', JSON.stringify(roleObject));
//     localStorage.setItem('user', JSON.stringify(userData));

//     setToken(accessToken);
//     setRefreshToken(refreshTokenValue);
//     setPermissions(userPermissions);
//     setRole(roleObject);
//     setUser(userData);

//     console.log('Login successful - Data stored:', {
//       token: accessToken ? 'Present' : 'Missing',
//       permissionsCount: Object.keys(userPermissions).length,
//       role: roleObject,
//       user: userData
//     });
//   };

//   const logout = async () => {
//     console.log('Logout function called');
    
//     try {
//       // Optional: Call backend logout API if you have one
//       // await AxiosInstance.post('/api/logout', { refresh_token: refreshToken });
      
//       // Clear localStorage
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('permissions');
//       localStorage.removeItem('role');
//       localStorage.removeItem('user');
      
//       console.log('Cleared localStorage');

//       // Clear state
//       setToken(null);
//       setRefreshToken(null);
//       setPermissions({});
//       setRole(null);
//       setUser(null);

//       console.log('Logout successful - State cleared');
//       return true;
//     } catch (error) {
//       console.error('Logout error:', error);
//       // Even if API call fails, clear local data
//       localStorage.clear();
//       setToken(null);
//       setRefreshToken(null);
//       setPermissions({});
//       setRole(null);
//       setUser(null);
//       return false;
//     }
//   };

//   const hasPermission = (permission) => {
//     const result = permissions[permission] === true;
//     console.log(`Checking permission "${permission}":`, result, 'from permissions:', permissions);
//     return result;
//   };

//   const hasAnyPermission = (permissionList) => {
//     const result = permissionList.some(permission => permissions[permission] === true);
//     console.log(`Checking any permission from [${permissionList.join(', ')}]:`, result);
//     return result;
//   };

//   const hasAllPermissions = (permissionList) => {
//     const result = permissionList.every(permission => permissions[permission] === true);
//     console.log(`Checking all permissions from [${permissionList.join(', ')}]:`, result);
//     return result;
//   };

//   const isAuthenticated = !!token;
//   const isSuperuser = role?.name === 'Super' || role?.name === 'Admin';

//   const getPermissionKeys = () => {
//     return Object.keys(permissions).filter(key => permissions[key] === true);
//   };

//   return (
//     <AuthContext.Provider 
//       value={{ 
//         token, 
//         refreshToken,
//         permissions, 
//         role, 
//         user,
//         loading,
//         login, 
//         logout,
//         hasPermission,
//         hasAnyPermission,
//         hasAllPermissions,
//         getPermissionKeys,
//         isAuthenticated,
//         isSuperuser
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };



'use client';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import AxiosInstance from '@/components/AxiosInstance';

export const AuthContext = createContext();

/**
 * Backend login response shape:
 * {
 *   message: "Successful",
 *   data: {
 *     id, first_name, last_name, full_name, username, email, mobile,
 *     profile_image, type, role, role_name,
 *     access_token, refresh_token,
 *     permissions: { "create_user": true, "read_user": true, ... }
 *   }
 * }
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken]           = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [permissions, setPermissions]   = useState({});
  const [role, setRole]             = useState(null);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);

  // ── Hydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    try {
      const storedToken        = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedPermissions  = localStorage.getItem('permissions');
      const storedRole         = localStorage.getItem('role');
      const storedUser         = localStorage.getItem('user');

      if (storedToken)        setToken(storedToken);
      if (storedRefreshToken) setRefreshToken(storedRefreshToken);

      if (storedPermissions) {
        const parsed = JSON.parse(storedPermissions);
        // Accept both { perm: true } objects and legacy ["perm"] arrays
        if (Array.isArray(parsed)) {
          const obj = {};
          parsed.forEach((p) => { obj[p] = true; });
          setPermissions(obj);
        } else if (typeof parsed === 'object' && parsed !== null) {
          setPermissions(parsed);
        }
      }

      if (storedRole) setRole(JSON.parse(storedRole));
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('AuthContext hydration error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── login: called with the full API response object ──────────────────────
  const login = useCallback((apiResponse) => {
    const d = apiResponse?.data;
    if (!d) {
      console.error('AuthContext.login: no data in response');
      return;
    }

    const accessToken   = d.access_token;
    const refreshTokenV = d.refresh_token;

    if (!accessToken || !refreshTokenV) {
      console.error('AuthContext.login: missing tokens', { accessToken, refreshTokenV });
      return;
    }

    // Permissions come back as { code_name: true, ... }
    const userPermissions = d.permissions && typeof d.permissions === 'object'
      ? d.permissions
      : {};

    const roleObject = { id: d.role, name: d.role_name };

    const userData = {
      id:            d.id,
      first_name:    d.first_name,
      last_name:     d.last_name,
      full_name:     d.full_name,
      username:      d.username,
      email:         d.email,
      mobile:        d.mobile,
      profile_image: d.profile_image,
      type:          d.type,
      role_id:       d.role,
      role_name:     d.role_name,
    };

    // Persist
    localStorage.setItem('access_token',  accessToken);
    localStorage.setItem('refresh_token', refreshTokenV);
    localStorage.setItem('permissions',   JSON.stringify(userPermissions));
    localStorage.setItem('role',          JSON.stringify(roleObject));
    localStorage.setItem('user',          JSON.stringify(userData));

    // State
    setToken(accessToken);
    setRefreshToken(refreshTokenV);
    setPermissions(userPermissions);
    setRole(roleObject);
    setUser(userData);
  }, []);

  // ── logout: calls backend then clears everything ─────────────────────────
  const logout = useCallback(async () => {
    try {
      await AxiosInstance.post('/api/user/v1/logout/', {
        refresh_token: localStorage.getItem('refresh_token'),
      });
    } catch (_) {
      // ignore – clear locally regardless
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('permissions');
      localStorage.removeItem('role');
      localStorage.removeItem('user');

      setToken(null);
      setRefreshToken(null);
      setPermissions({});
      setRole(null);
      setUser(null);
    }
  }, []);

  // ── Permission helpers ───────────────────────────────────────────────────
  const hasPermission    = useCallback((perm)     => permissions[perm] === true, [permissions]);
  const hasAnyPermission = useCallback((list)     => list.some((p)  => permissions[p] === true), [permissions]);
  const hasAllPermissions= useCallback((list)     => list.every((p) => permissions[p] === true), [permissions]);
  const getPermissionKeys= useCallback(()         => Object.keys(permissions).filter((k) => permissions[k] === true), [permissions]);

  const isAuthenticated = !!token;
  const isSuperuser     = user?.type === 'EMPLOYEE' && (role?.name === 'Super' || role?.name === 'Admin');

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        permissions,
        role,
        user,
        loading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getPermissionKeys,
        isAuthenticated,
        isSuperuser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
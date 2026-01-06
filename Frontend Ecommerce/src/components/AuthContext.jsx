// 'use client';
// import React, { createContext, useState, useEffect } from 'react';
// import AxiosInstance from "@/components/AxiosInstance";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   console.log('AuthProvider is rendered');

//   const [token, setToken] = useState(null);
//   const [refreshToken, setRefreshToken] = useState(null);
//   const [permissions, setPermissions] = useState({}); // Changed from [] to {}
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
//         // Check if permissions is an object or array
//         if (typeof parsedPermissions === 'object' && parsedPermissions !== null) {
//           setPermissions(parsedPermissions);
//           console.log('Loaded permissions object:', parsedPermissions);
//         } else if (Array.isArray(parsedPermissions)) {
//           // Convert array to object if needed
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
    
//     // Backend returns: { message: "Successful", data: {...}, count: null }
//     // Extract data from the nested data object
//     const responseData = apiResponse.data;
    
//     if (!responseData) {
//       console.error('No data in API response');
//       return;
//     }

//     const accessToken = responseData.access_token;
//     const refreshTokenValue = responseData.refresh_token;
//     const userPermissions = responseData.permissions || {}; // Object, not array
//     const userRoleId = responseData.role; // This is the ID (1)
//     const roleName = responseData.role_name; // This is the name ("Super")
    
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
//       permissions: userPermissions // Include permissions in user data
//     };

//     // Create a role object with both ID and name
//     const roleObject = {
//       id: userRoleId,
//       name: roleName
//     };

//     // Validation check
//     if (!accessToken || !refreshTokenValue) {
//       console.error('Missing tokens in response:', { accessToken, refreshTokenValue });
//       return;
//     }

//     // Store in localStorage
//     localStorage.setItem('access_token', accessToken);
//     localStorage.setItem('refresh_token', refreshTokenValue);
//     localStorage.setItem('permissions', JSON.stringify(userPermissions));
//     localStorage.setItem('role', JSON.stringify(roleObject));
//     localStorage.setItem('user', JSON.stringify(userData));

//     // Update state
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
//     // ... (keep your existing logout code) ...
//   };

//   // Updated permission checking functions for object-based permissions
//   const hasPermission = (permission) => {
//     // Check if permission exists and is true in the permissions object
//     const result = permissions[permission] === true;
//     console.log(`Checking permission "${permission}":`, result, 'from permissions:', permissions);
//     return result;
//   };

//   // Helper function to check multiple permissions (user needs at least one)
//   const hasAnyPermission = (permissionList) => {
//     const result = permissionList.some(permission => permissions[permission] === true);
//     console.log(`Checking any permission from [${permissionList.join(', ')}]:`, result);
//     return result;
//   };

//   // Helper function to check if user has all permissions
//   const hasAllPermissions = (permissionList) => {
//     const result = permissionList.every(permission => permissions[permission] === true);
//     console.log(`Checking all permissions from [${permissionList.join(', ')}]:`, result);
//     return result;
//   };

//   // Check if user is authenticated
//   const isAuthenticated = !!token;

//   // Check if user is superuser (based on role name)
//   const isSuperuser = role?.name === 'Super' || role?.name === 'Admin';

//   // Get all permission keys as array (for components that need array)
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
//         getPermissionKeys, // New function
//         isAuthenticated,
//         isSuperuser
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };



'use client';
import React, { createContext, useState, useEffect } from 'react';
import AxiosInstance from "@/components/AxiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider is rendered');

  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage on mount
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedPermissions = localStorage.getItem('permissions');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');

    console.log('Loading auth data from localStorage...');
    console.log('Stored token:', storedToken);
    console.log('Stored permissions:', storedPermissions);
    console.log('Stored role:', storedRole);
    console.log('Stored user:', storedUser);

    if (storedToken) {
      setToken(storedToken);
      console.log('Loaded access token');
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        if (typeof parsedPermissions === 'object' && parsedPermissions !== null) {
          setPermissions(parsedPermissions);
          console.log('Loaded permissions object:', parsedPermissions);
        } else if (Array.isArray(parsedPermissions)) {
          const permissionsObj = {};
          parsedPermissions.forEach(perm => {
            permissionsObj[perm] = true;
          });
          setPermissions(permissionsObj);
          console.log('Converted permissions array to object:', permissionsObj);
        }
      } catch (error) {
        console.error('Error parsing permissions:', error);
        setPermissions({});
      }
    }

    if (storedRole) {
      try {
        const parsedRole = JSON.parse(storedRole);
        setRole(parsedRole);
        console.log('Loaded role:', parsedRole);
      } catch (error) {
        console.error('Error parsing role:', error);
        setRole(null);
      }
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Loaded user:', parsedUser);
      } catch (error) {
        console.error('Error parsing user:', error);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (apiResponse) => {
    console.log('Login function called with response:', apiResponse);
    
    const responseData = apiResponse.data;
    
    if (!responseData) {
      console.error('No data in API response');
      return;
    }

    const accessToken = responseData.access_token;
    const refreshTokenValue = responseData.refresh_token;
    const userPermissions = responseData.permissions || {};
    const userRoleId = responseData.role;
    const roleName = responseData.role_name;
    
    const userData = {
      id: responseData.id,
      first_name: responseData.first_name,
      last_name: responseData.last_name,
      full_name: responseData.full_name,
      username: responseData.username,
      email: responseData.email,
      mobile: responseData.mobile,
      profile_image: responseData.profile_image,
      role_id: userRoleId,
      role_name: roleName,
      type: responseData.type,
      permissions: userPermissions
    };

    const roleObject = {
      id: userRoleId,
      name: roleName
    };

    if (!accessToken || !refreshTokenValue) {
      console.error('Missing tokens in response:', { accessToken, refreshTokenValue });
      return;
    }

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshTokenValue);
    localStorage.setItem('permissions', JSON.stringify(userPermissions));
    localStorage.setItem('role', JSON.stringify(roleObject));
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    setPermissions(userPermissions);
    setRole(roleObject);
    setUser(userData);

    console.log('Login successful - Data stored:', {
      token: accessToken ? 'Present' : 'Missing',
      permissionsCount: Object.keys(userPermissions).length,
      role: roleObject,
      user: userData
    });
  };

  const logout = async () => {
    console.log('Logout function called');
    
    try {
      // Optional: Call backend logout API if you have one
      // await AxiosInstance.post('/api/logout', { refresh_token: refreshToken });
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('permissions');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      
      console.log('Cleared localStorage');

      // Clear state
      setToken(null);
      setRefreshToken(null);
      setPermissions({});
      setRole(null);
      setUser(null);

      console.log('Logout successful - State cleared');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      localStorage.clear();
      setToken(null);
      setRefreshToken(null);
      setPermissions({});
      setRole(null);
      setUser(null);
      return false;
    }
  };

  const hasPermission = (permission) => {
    const result = permissions[permission] === true;
    console.log(`Checking permission "${permission}":`, result, 'from permissions:', permissions);
    return result;
  };

  const hasAnyPermission = (permissionList) => {
    const result = permissionList.some(permission => permissions[permission] === true);
    console.log(`Checking any permission from [${permissionList.join(', ')}]:`, result);
    return result;
  };

  const hasAllPermissions = (permissionList) => {
    const result = permissionList.every(permission => permissions[permission] === true);
    console.log(`Checking all permissions from [${permissionList.join(', ')}]:`, result);
    return result;
  };

  const isAuthenticated = !!token;
  const isSuperuser = role?.name === 'Super' || role?.name === 'Admin';

  const getPermissionKeys = () => {
    return Object.keys(permissions).filter(key => permissions[key] === true);
  };

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
        isSuperuser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
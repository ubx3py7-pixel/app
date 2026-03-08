// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(null);
  const [userToken, setUserToken]   = useState(null);
  const [userInfo, setUserInfo]     = useState(null);

  const loginAdmin = (token) => setAdminToken(token);
  const logoutAdmin = () => setAdminToken(null);

  const loginUser = (token, info) => { setUserToken(token); setUserInfo(info); };
  const logoutUser = () => { setUserToken(null); setUserInfo(null); };

  return (
    <AuthContext.Provider value={{ adminToken, loginAdmin, logoutAdmin, userToken, userInfo, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

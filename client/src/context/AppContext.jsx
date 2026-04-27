import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const normalizeUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== "object") return null;

  const normalizedRole =
    (typeof rawUser.role === "string" && rawUser.role.trim().toLowerCase()) ||
    (typeof rawUser.userType === "string" &&
      rawUser.userType.trim().toLowerCase()) ||
    null;

  if (!normalizedRole) return null;

  return {
    ...rawUser,
    role: normalizedRole,
  };
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("mindbridge_user");
    const savedTheme = localStorage.getItem("mindbridge_theme") || "light";

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const normalizedUser = normalizeUser(parsedUser);

        if (normalizedUser) {
          setUser(normalizedUser);
          localStorage.setItem(
            "mindbridge_user",
            JSON.stringify(normalizedUser),
          );
        } else {
          localStorage.removeItem("mindbridge_user");
          setUser(null);
        }
      } catch {
        localStorage.removeItem("mindbridge_user");
        setUser(null);
      }
    }

    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    setLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("mindbridge_theme", newTheme);

    if (newTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const login = (authData) => {
    if (authData.user && authData.token) {
      const normalizedUser = normalizeUser(authData.user);
      if (!normalizedUser) {
        throw new Error("Invalid user payload: missing role");
      }

      const userData = { ...normalizedUser, token: authData.token };
      setUser(userData);
      localStorage.setItem("mindbridge_user", JSON.stringify(userData));
    } else {
      const normalizedUser = normalizeUser(authData);
      if (!normalizedUser) {
        throw new Error("Invalid user payload: missing role");
      }

      setUser(normalizedUser);
      localStorage.setItem("mindbridge_user", JSON.stringify(normalizedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mindbridge_user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("mindbridge_user", JSON.stringify(userData));
  };

  const value = {
    user,
    theme,
    loading,
    toggleTheme,
    login,
    logout,
    updateUser,
    isStudent: user?.role === "student",
    isCounsellor: user?.role === "counsellor",
    isAdmin: user?.role === "admin",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};



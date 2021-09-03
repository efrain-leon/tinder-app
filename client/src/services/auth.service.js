import axios from "axios";

const API_URL = "http://localhost:3010/api/auth/";

const register = (name, surname, email, password) => {
  return axios.post(API_URL + "signup", {
    name,
    surname,
    email,
    password,
  });
};

const login = (email, password) => {
  return axios
    .post(API_URL + "signin", {
      email,
      password,
    })
    .then((res) => {
      if (res.data.response && res.data.response.token) {
        localStorage.setItem("TINDER_ACCESS_TOKEN", JSON.stringify(res.data.response.token));
        localStorage.setItem("TINDER_CURRENT_USER", JSON.stringify(res.data.response.user));
      }

      return res.data.response;
    });
};

const logout = () => {
  localStorage.removeItem("TINDER_ACCESS_TOKEN");
  localStorage.removeItem("TINDER_CURRENT_USER");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("TINDER_CURRENT_USER"));
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
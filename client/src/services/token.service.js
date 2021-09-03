class TokenService {
  getLocalRefreshToken() {
    const user = JSON.parse(localStorage.getItem("TINDER_ACCESS_TOKEN"));
    return user?.refreshToken;
  }

  getLocalAccessToken() {
    return JSON.parse(localStorage.getItem("TINDER_ACCESS_TOKEN"));
  }

  updateLocalAccessToken(token) {
    let user = JSON.parse(localStorage.getItem("TINDER_ACCESS_TOKEN"));
    user.accessToken = token;
    localStorage.setItem("TINDER_ACCESS_TOKEN", JSON.stringify(user));
  }

  getUser() {
    return JSON.parse(localStorage.getItem("TINDER_CURRENT_USER"));
  }

  setUser(user) {
    console.log(JSON.stringify(user));
    localStorage.setItem("TINDER_ACCESS_TOKEN", JSON.stringify(user));
  }

  removeUser() {
    localStorage.removeItem("TINDER_ACCESS_TOKEN");
  }
}

export default new TokenService();

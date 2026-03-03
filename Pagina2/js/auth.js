export const Auth = {
  getToken() {
    return localStorage.getItem("token");
  },

  setToken(token) {
    localStorage.setItem("token", token);
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("pedidosBadge");
  },

  isLogged() {
    return !!this.getToken();
  }
};
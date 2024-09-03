const navigationbar = Vue.component("navigationbar", {
  template: `
      <div>
        <nav class="navbar">
          <div class="container">
            <div class="navbar-brand" to="#">
              <h4>LibraryApp</h4>
            </div>
            <div class="d-flex ms-auto"> <!-- Move to the right -->
              <router-link 
                v-if="userToken && userRole === 'librarian'" 
                class="nav-link active" 
                to="/librarian_dashboard">
                <span class="navbar-text"><strong>Dashboard</strong></span>
              </router-link>
              <router-link 
                v-if="userToken && userRole === 'librarian'" 
                class="nav-link active" 
                to="/librarian_requests">
                <span class="navbar-text"><strong>Requests</strong></span>
              </router-link>
              <router-link 
                v-if="userToken && userRole === 'librarian'" 
                class="nav-link active" 
                to="/librarian_stats">
                <span class="navbar-text"><strong>Stats</strong></span>
              </router-link>
              <router-link 
                v-if="userToken && userRole === 'user'" 
                class="nav-link active" 
                to="/user_dashboard">
                <span class="navbar-text"><strong>Books</strong></span>
              </router-link>
              <router-link 
                v-if="userToken && userRole === 'user'" 
                class="nav-link active" 
                to="/my_books">
                <span class="navbar-text"><strong>My Books</strong></span>
              </router-link>
              <router-link 
                v-if="userToken && userRole === 'user'" 
                class="nav-link active" 
                to="/user_stats">
                <span class="navbar-text"><strong>Stats</strong></span>
              </router-link>
              <router-link 
                v-if="!userToken" 
                class="nav-link active" 
                to="/login">
                <span class="navbar-text"><strong>Login</strong></span>
              </router-link>
              <button 
                v-if="userToken" 
                @click="handleLogout" 
                class="btn btn-link nav-link active">
                <span class="navbar-text"><strong>Logout</strong></span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    `,
  data() {
    return {
      userToken: "",
      userRole: "",
    };
  },
  mounted() {
    this.userToken = localStorage.getItem("userToken") || "";
    this.userRole = localStorage.getItem("userRole") || "";
  },
  methods: {
    handleLogout() {
      fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Logout failed.");
          } else {
            return response.json();
          }
        })
        .then(() => {
          localStorage.removeItem("userToken");
          localStorage.removeItem("userRole");
          this.userToken = "";
          this.$router.push("/");
        })
        .catch((error) => {
          alert("Logout failed. Please try again.");
          console.error(error);
        });
    },
  },
});

export default navigationbar;

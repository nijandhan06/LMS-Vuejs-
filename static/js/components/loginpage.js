const loginpage = Vue.component("loginpage", {
  template: `
      <div>
        <div class="container">
          <form @submit.prevent="submitLogin" class="login-form">
            <h1>Login</h1>
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" class="form-control form-input" v-model="user" id="username" placeholder="Username" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" class="form-control form-input" v-model="pass" id="password" placeholder="Password" required>
            </div>
            <button type="submit" class="btn btn-primary form-button" style="margin-bottom:10px;">Login</button>
            <p>Don't have an account? <router-link to="/signup">SignUp</router-link></p>
          </form>
        </div>
      </div>
    `,
  data() {
    return {
      user: "",
      pass: "",
    };
  },
  methods: {
    submitLogin() {
      fetch("/userlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.user,
          password: this.pass,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert("Something went wrong. Please try again.");
            return;
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            alert("Invalid credentials");
            return;
          }
          localStorage.setItem("userToken", data.token);
          localStorage.setItem("userRole", data.role);
          if (data.role === "user") {
            this.$router.push("/user_dashboard");
          } else {
            this.$router.push("/librarian_dashboard");
          }
          location.reload();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});

export default loginpage;

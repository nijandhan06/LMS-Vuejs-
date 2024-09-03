const signuppage = Vue.component("signuppage", {
  template: `
      <div>
        <div class="container">
          <form @submit.prevent="submitSignUp" class="signup-form">
            <h1>Sign Up</h1>
            <div class="form-group">
              <label for="user">Username</label>
              <input type="text" class="form-control form-input" 
              v-model="user" 
              id="user" placeholder="Username" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" class="form-control form-input" 
              v-model="mail" 
              id="email" placeholder="Email" required>
            </div>
            <div class="form-group">
              <label for="pass">Password</label>
              <input type="password" class="form-control form-input" 
              v-model="pass" 
              id="pass" placeholder="Password" required>
            </div>
            <button type="submit" class="btn btn-primary form-button" style="margin-bottom:10px;">Sign Up</button>
            <p>Already have an account? <router-link to="/login">Login</router-link></p>
          </form>
        </div>
      </div>
    `,
  data() {
    return {
      user: "",
      mail: "",
      pass: "",
    };
  },
  methods: {
    submitSignUp() {
      fetch("/registers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.user,
          email: this.mail,
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
          if (data.message === "user already exists") {
            alert("User already exists");
            return;
          }
          alert("User registered successfully");
          this.$router.push("/login");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});

export default signuppage;

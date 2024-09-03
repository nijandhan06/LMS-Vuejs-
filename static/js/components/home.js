const home = Vue.component("home", {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-80">
      <div class="card text-center" style="width: 24rem; margin-top:50px;">
        <div class="card-body">
          <h1 class="card-title">Welcome to the Library App</h1>
          <p class="card-text">Discover a world of books at your fingertips.</p>
          <div class="d-grid gap-2">
            <button @click="signUp" class="btn btn-primary">Sign Up</button>
            <button @click="login" class="btn btn-secondary">Login</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      message: "",
    };
  },
  methods: {
    signUp() {
      this.$router.push("/signup");
    },
    login() {
      this.$router.push("/login");
    },
  },
});

export default home;

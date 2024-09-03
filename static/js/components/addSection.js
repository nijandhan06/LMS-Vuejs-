const addSection = Vue.component("addSection", {
  template: `
      <div>
        <div class="container">
          <form @submit.prevent="createSection" class="custom-form">
            <h1>Add Section</h1>
            <div class="form-group">
              <label for="name">Section Name</label>
              <input type="text" class="form-control form-input" id="name" v-model="name" required>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <input class="form-control form-input" id="description" v-model="description" required>
            </div>
            <button type="submit" class="btn btn-primary">Add Section</button>
            <button type="button" class="btn btn-danger" @click="goback()" style="margin-top:10px;">Cancel</button>
          </form>
        </div>
      </div>
    `,
  data() {
    return {
      name: "",
      description: "",
    };
  },
  methods: {
    goback() {
      this.$router.push("/librarian_dashboard");
    },
    createSection() {
      fetch("/api/section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
        body: JSON.stringify({
          name: this.name,
          description: this.description,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert("An error occurred");
          }
        })
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert("Section added successfully");
            this.name = "";
            this.description = "";
            this.$router.push("/librarian_dashboard");
          }
        });
    },
  },
});

export default addSection;

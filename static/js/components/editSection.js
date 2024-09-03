const editSection = Vue.component("editSection", {
  template: `
      <div>
        <div class="container">
          <form @submit.prevent="updateSection" class="custom-form">
            <h1>Edit Section</h1>
            <div class="form-group">
              <label for="name">Section Name</label>
              <input type="text" class="form-control form-input" id="name" v-model="name" required>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <input class="form-control form-input" id="description" v-model="description" required>
            </div>
            <button type="submit" class="btn btn-primary">Edit Section</button>
            <button type="button" class="btn btn-danger" @click="goBack()" style="margin-top:10px;">Cancel</button>
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
  created() {
    this.fetchSection();
  },
  methods: {
    goBack() {
      this.$router.push("/librarian_dashboard");
    },
    fetchSection() {
      fetch("/section/" + this.$route.params.id, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.name = data.name;
          this.description = data.description;
        });
    },
    updateSection() {
      fetch("/api/section/" + this.$route.params.id, {
        method: "PUT",
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
            alert(data.message);
            this.name = "";
            this.description = "";
            this.$router.push("/librarian_dashboard");
          }
        });
    },
  },
});

export default editSection;

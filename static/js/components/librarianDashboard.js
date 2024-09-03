const librarianDashboard = Vue.component("librarianDashboard", {
  template: `
      <div>
        <div class="container">
          <h1>Librarian Dashboard</h1>
          <router-link to="/add_section" class="btn btn-primary">Add Section</router-link>
          <div v-if="sections.length === 0">
            <h2>No sections available</h2>
          </div>
          <div v-else>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Section ID</th>
                  <th>Section Name</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="section in sections" :key="section.id">
                  <td>{{ section.id }}</td>
                  <td>{{ section.name }}</td>
                  <td>{{ section.description }}</td>
                  <td>
                    <button class="btn btn-primary" @click="viewSection(section.id)">View</button>
                    <button class="btn btn-warning" @click="edit(section.id)">Edit</button>
                    <button class="btn btn-danger" @click="remove(section.id)">Delete</button>
                    <button class="btn btn-primary" @click="exportCsv(section.id)">Export</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      sections: [],
    };
  },
  mounted() {
    if (!localStorage.getItem("userToken")) {
      this.$router.push("/login");
    }
    this.fetchSections();
  },
  methods: {
    viewSection(id) {
      this.$router.push("/view_section/" + id);
    },
    fetchSections() {
      fetch("/api/section", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.sections = data;
        });
    },
    remove(id) {
      if (!confirm("Are you sure you want to delete this section?")) {
        return;
      }
      fetch("/api/section/" + id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      }).then(() => {
        this.fetchSections();
      });
    },
    edit(id) {
      this.$router.push("/edit_section/" + id);
    },
    exportCsv(id) {
      fetch("/export/section/" + id, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
        })
        .catch((error) => {
          alert(error.message);
        });
    },
  },
});

export default librarianDashboard;

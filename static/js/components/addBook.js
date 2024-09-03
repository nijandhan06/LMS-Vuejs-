const addBook = Vue.component("addBook", {
  template: `
      <div>
        <div class="container">
          <form @submit.prevent="submitBook" class="custom-form">
            <h1>Add Book</h1>
            <div class="form-group">
              <label for="title">Book Name</label>
              <input type="text" class="form-control form-input" id="title" v-model="title" required>
            </div>
            <div class="form-group">
              <label for="author">Author</label>
              <input class="form-control form-input" id="author" v-model="author" required>
            </div>
            <div class="form-group">
              <label for="content">Content</label>
              <textarea class="form-control form-input" id="content" v-model="content" required></textarea>
            </div>
            <div class="form-group">
              <label for="return_date">Return Date</label>
              <input type="date" class="form-control form-input" id="return_date" v-model="returnDate" required>
            </div>
            <button type="submit" class="btn btn-primary">Add Book</button>
            <button type="button" class="btn btn-danger" @click="cancel" style="margin-top:10px;">Cancel</button>
          </form>
        </div>
      </div>
    `,
  data() {
    return {
      title: "",
      author: "",
      content: "",
      returnDate: "",
      sectionId: this.$route.params.id,
    };
  },
  methods: {
    cancel() {
      this.$router.push("/view_section/" + this.sectionId);
    },
    submitBook() {
      fetch("/api/section_book/" + this.sectionId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
        body: JSON.stringify({
          title: this.title,
          author: this.author,
          content: this.content,
          date_return: this.returnDate,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert("Something went wrong");
          }
        })
        .then((data) => {
          if (data.error) {
            alert("Book already exists");
          } else {
            alert(data.message);
            this.title = "";
            this.author = "";
            this.content = "";
            this.returnDate = "";
            this.dateIssued = "";
            this.$router.push("/view_section/" + this.sectionId);
          }
        });
    },
  },
});

export default addBook;

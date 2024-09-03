const editBook = Vue.component("editBook", {
  template: `
      <div>
        <div class="container">
          <form @submit.prevent="updateBook" class="custom-form">
            <h1>Edit Book</h1>
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
            <button type="submit" class="btn btn-primary" style="margin-bottom:10px;">Edit Book</button>
            <button type="button" class="btn btn-danger" @click="cancel">Cancel</button>
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
      dateIssued: "",
      bookId: this.$route.params.id,
      sectionId: "",
    };
  },
  mounted() {
    this.loadBook();
  },
  methods: {
    loadBook() {
      fetch("/book/" + this.bookId, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("userToken"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.title = data.title;
          this.author = data.author;
          this.content = data.content;
          this.returnDate = data.date_return;
          this.sectionId = data.section_id;
        });
    },
    cancel() {
      this.$router.push("/view_section/" + this.sectionId);
    },
    updateBook() {
      fetch("/api/book/" + this.bookId, {
        method: "PUT",
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
            alert(data.error);
          } else {
            alert(data.message);
            this.title = "";
            this.author = "";
            this.content = "";
            this.returnDate = "";
            this.$router.push("/view_section/" + this.sectionId);
          }
        });
    },
  },
});

export default editBook;

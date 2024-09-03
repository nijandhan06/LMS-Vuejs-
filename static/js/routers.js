import home from "./components/home.js";
import loginpage from "./components/loginpage.js";
import signuppage from "./components/signuppage.js";
import librarianDashboard from "./components/librarianDashboard.js";
import UserDashboard from "./components/userDashboard.js";
import addSection from "./components/addSection.js";
import viewSection from "./components/viewSection.js";
import editSection from "./components/editSection.js";
import addBook from "./components/addBook.js";
import editBook from "./components/editBook.js";
import librarianUserRequests from "./components/librarianUserRequest.js";
import myBooks from "./components/myBooks.js";
import viewBook from "./components/viewBook.js";
import userstatistics from "./components/userStats.js";
import libStats from "./components/librarianStats.js";

const router = new VueRouter({
  routes: [
    { path: "/", component: home, name: "home" },
    { path: "/login", component: loginpage, name: "login" },
    { path: "/signup", component: signuppage, name: "signup" },
    {
      path: "/librarian_dashboard",
      component: librarianDashboard,
      name: "librarian",
    },
    { path: "/user_dashboard", component: UserDashboard, name: "user" },
    { path: "/add_section", component: addSection, name: "addSection" },
    { path: "/view_section/:id", component: viewSection, name: "viewSection" },
    { path: "/edit_section/:id", component: editSection, name: "editSection" },
    { path: "/add_book/:id", component: addBook, name: "addBook" },
    { path: "/edit_book/:id", component: editBook, name: "editBook" },
    {
      path: "/librarian_requests",
      component: librarianUserRequests,
      name: "librarianuserRequests",
    },
    { path: "/my_books", component: myBooks, name: "myBooks" },
    { path: "/view_book/:id", component: viewBook, name: "viewBook" },
    { path: "/user_stats", component: userstatistics, name: "userStats" },
    { path: "/librarian_stats", component: libStats, name: "librarianStats" },
    { path: "*", redirect: "/" },
  ],
});

export default router;

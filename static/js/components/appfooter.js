const appfooter = Vue.component("appfooter", {
  template: `
    <div>
      <footer>
        <div class="app-footer-container">
          <p>© 2024 Library Application. All rights reserved.</p>
          <div class="social-icons">
          <a href="#" class="mx-2"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="mx-2"><i class="fab fa-twitter"></i></a>
          <a href="#" class="mx-2"><i class="fab fa-instagram"></i></a>
          <a href="#" class="mx-2"><i class="fab fa-linkedin-in"></i></a>
        </div>
        </div>
      </footer>
    </div>
  `,
});

export default appfooter;

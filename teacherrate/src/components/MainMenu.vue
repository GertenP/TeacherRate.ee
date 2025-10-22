<template>
  <nav class="navbar navbar-expand-lg custom-navbar py-3">
    <div class="container-fluid d-flex align-items-center">
      <button type="button" class="btn btn-danger me-3">Logi välja</button>

      <form class="d-flex flex-grow-1 me-3" role="search" @submit.prevent style="max-width: 500px;">
        <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Otsi õppeainet"
          aria-label="Search" />
        <button class="btn btn-success" type="button">Otsi</button>
      </form>

      <div class="d-flex align-items-center">
        <h2 class="mb-0 me-2">Kasutaja</h2>
        <img src="/pfp.jpg" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
      </div>
    </div>
  </nav>

  <div class="container-fluid my-5">
    <div class="row">
      <div class="classes col-6 ps-4">
        <!-- ADD CLASS FORM -->
        <div class="mb-4">
          <input v-model="newClassName" type="text" class="form-control mb-2" placeholder="Lisa uus õppeaine" />
          <button class="btn btn-success" @click="addClass">Lisa</button>
        </div>

        <!-- CLASS LIST -->
        <div class="class-list" style="background-color: darkgray;">
          <div v-for="(cls, index) in filteredClasses" :key="cls.name" class="card mb-3 class-card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">{{ cls.name }}</h5>
              <div class="d-flex align-items-center">
                <div class="class-rating me-2">
                  <img src="../assets/riks.jpeg" alt="" style="max-height: 50px;" />
                  <span class="me-2">⭐ {{ cls.rating.toFixed(1) }}</span>
                  <button class="btn btn-sm btn-primary" @click="openMenu(cls)">Hinda</button>
                </div>
                <button class="btn btn-sm btn-danger" @click="deleteClass(index)">Kustuta</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right half column -->
      <div class="col-6">
        <img id="elite_gif" src="../assets/text.png" alt="Description of text" />
        <img id="elite_gif" src="../assets/elitehackers.gif" alt="Description of GIF" />
      </div>
    </div>
  </div>

  <!-- HALF-SCREEN MENU -->
  <transition name="slide">
    <div v-if="menuOpen" class="rating-menu">
      <div class="rating-content">
        <h3>{{ selectedClass.name }}</h3>
        <p>Keskmine hinne: {{ selectedClass.rating.toFixed(1) }}</p>

        <!-- SHOW OTHERS’ COMMENTS -->
        <div class="other-ratings mb-4">
          <h5>Teiste hinnangud:</h5>
          <ul class="list-group">
            <li v-for="(r, index) in selectedClass.comments" :key="index"
              class="list-group-item d-flex justify-content-between align-items-center" @click="selectedComment = r"
              style="cursor: pointer;">

              <span class="text-truncate" style="max-width: 60%;">{{ truncate(r.text) }}</span>

              <!-- Wrap stars + button -->
              <div class="d-flex align-items-center">
                <span class="me-2">⭐ {{ r.stars }}</span>
                <button class="btn btn-sm btn-danger" @click.stop="deleteComment(index)">Kustuta</button>
              </div>

            </li>
          </ul>
        </div>

        <!-- TOGGLE BETWEEN VIEWING AND RATING -->
        <div v-if="!showRatingInput">
          <button class="btn btn-primary" @click="showRatingInput = true">Lisa oma hinnang</button>
          <button class="btn btn-secondary ms-2" @click="closeMenu">Sulge</button>
        </div>

        <!-- RATING INPUT SECTION -->
        <div v-else>
          <input type="number" v-model="userRating" min="1" max="5" class="form-control my-3"
            placeholder="Sinu hinne" />
          <textarea v-model="userComment" class="form-control mb-3" placeholder="Sinu kommentaar"></textarea>
          <div>
            <button class="btn btn-success me-2" @click="submitRating">Salvesta</button>
            <button class="btn btn-secondary" @click="showRatingInput = false">Tagasi</button>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- COMMENT POPUP -->
  <div v-if="selectedComment" class="comment-popup" @click.self="selectedComment = null">
    <div class="popup-content">
      <h5>Hinnang</h5>
      <p class="comment-text">{{ selectedComment.text }}</p>
      <p>⭐ {{ selectedComment.stars }}</p>
      <button class="btn btn-secondary" @click="selectedComment = null">Sulge</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainMenu",
  data() {
    return {
      newClassName: "",
      searchQuery: "",
      menuOpen: false,
      showRatingInput: false,
      selectedClass: {},
      userRating: null,
      userComment: "",
      selectedComment: null,
      classes: []
    };
  },
  computed: {
    filteredClasses() {
      const q = this.searchQuery.toLowerCase();
      return this.classes.filter(c => c.name.toLowerCase().includes(q));
    }
  },
  mounted() {
    fetch("http://localhost:3000/api/classes")
      .then(res => res.json())
      .then(data => this.classes = data)
      .catch(() => console.error("Failed to load classes"));
  },
  methods: {
    truncate(text, max = 20) {
      return text.length > max ? text.slice(0, max) + '…' : text;
    },
    openMenu(cls) {
      this.selectedClass = cls;
      this.menuOpen = true;
      this.showRatingInput = false;
      this.userRating = null;
      this.userComment = "";
    },
    closeMenu() {
      this.menuOpen = false;
    },
    async submitRating() {
      if (!this.userRating || !this.userComment) return;

      const rating = Number(this.userRating);
      if (rating < 1 || rating > 5) {
        alert("Hinne peab olema vahemikus 1 kuni 5!");
        return;
      }

      const newRating = { text: this.userComment, stars: rating };

      try {
        const updatedClass = await fetch(
          `http://localhost:3000/api/classes/${this.selectedClass.name}/rating`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRating)
          }
        ).then(res => res.json());

        Object.assign(this.selectedClass, updatedClass);
        const index = this.classes.findIndex(c => c.name === updatedClass.name);
        if (index !== -1) {
          this.classes.splice(index, 1, updatedClass);
        }

        // Reset rating input
        this.showRatingInput = false;
        this.userRating = null;
        this.userComment = "";

      } catch (err) {
        console.error(err);
        alert("Hinne salvestamine ebaõnnestus!");
      }
    },

    async deleteComment(index) {
      if (!confirm("Kas oled kindel, et soovid selle kommentaari kustutada?")) return;

      this.selectedClass.comments.splice(index, 1)[0];

      // Recalculate average
      this.selectedClass.rating =
        this.selectedClass.comments.reduce((sum, c) => sum + c.stars, 0) /
        (this.selectedClass.comments.length || 1);

      // Update JSON on server
      await fetch(`http://localhost:3000/api/classes/${this.selectedClass.name}/rating/${index}`, {
        method: "DELETE"
      });
    },
    async addClass() {
      const name = this.newClassName.trim();
      if (!name) return alert("Sisesta klassi nimi!");

      try {
        const res = await fetch("http://localhost:3000/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });

        const data = await res.json();

        if (!res.ok) return alert(data.error);

        this.classes.push(data);
        this.newClassName = "";
      } catch (err) {
        console.error(err);
        alert("Klassi lisamine ebaõnnestus");
      }
    },
    async deleteClass(index) {
      const cls = this.classes[index];
      if (!confirm(`Kas oled kindel, et soovid kustutada "${cls.name}"?`)) return;

      try {
        const res = await fetch(`http://localhost:3000/api/classes/${cls.name}`, {
          method: "DELETE"
        });

        if (!res.ok) {
          const data = await res.json();
          return alert(data.error);
        }

        this.classes.splice(index, 1);
      } catch (err) {
        console.error(err);
        alert("Kustutamine ebaõnnestus");
      }
    }
  }
};
</script>

<style>
#elite_gif {
  width: 100%;
}

.class-list {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 8px;
  border: 5px solid black;
  border-radius: 1rem;
  padding: 1rem;
  background-color: darkgray;
}

.class-header {
  padding-bottom: 1rem;
}

.custom-navbar {
  background-color: darkgray;
}

/* Half-screen overlay */
.rating-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 50vw;
  height: 100vh;
  background-color: #171718;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.4);
  z-index: 1050;
  overflow-y: auto;
  padding: 2rem;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.rating-content {
  width: 80%;
  text-align: center;
}

/* COMMENT POPUP */
.comment-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.popup-content {
  background: #222;
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 60%;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 0 10px black;
}

.comment-text {
  white-space: pre-wrap;
  margin: 1rem 0;
}

/* Smooth slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>

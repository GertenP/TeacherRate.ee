<template>
  <nav class="navbar navbar-expand-lg custom-navbar py-3">
    <div class="container-fluid d-flex align-items-center">
      <button type="button" class="btn btn-danger me-3">Logi välja</button>

      <form class="d-flex flex-grow-1 me-3" role="search" style="max-width: 500px;">
        <input class="form-control me-2" type="search" placeholder="Otsi õppeainet" aria-label="Search" />
        <button class="btn btn-success" type="submit">Otsi</button>
      </form>

      <div class="d-flex align-items-center">
        <h2 class="mb-0 me-2">Kasutaja</h2>
        <img src="/pfp.jpg" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
      </div>
    </div>
  </nav>

  <div class="container-fluid my-5">
    <div class="row">
      <!-- CLASS LIST -->
      <div class="classes col-6 ps-4">
        <h2 class="class-header mb-3">Õppeained</h2>

        <div class="class-list" style="background-color: darkgray;">
          <div v-for="cls in classes" :key="cls.name" class="card mb-3 class-card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">{{ cls.name }}</h5>
              <div class="class-rating">
                <img src="../assets/riks.jpeg" alt="" style="max-height: 50px;">
                <span class="me-2">⭐ {{ cls.rating.toFixed(1) }}</span>
                <button class="btn btn-sm btn-primary" @click="openMenu(cls)">Hinda</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT HALF -->
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
            <li
              v-for="(r, index) in selectedClass.comments"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-center"
              @click="selectedComment = r"
              style="cursor: pointer;"
            >
              <span class="text-truncate" style="max-width: 70%;">{{ r.text }}</span>
              <span>⭐ {{ r.stars }}</span>
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
          <input
            type="number"
            v-model="userRating"
            min="1"
            max="5"
            class="form-control my-3"
            placeholder="Sinu hinne"
          />
          <textarea
            v-model="userComment"
            class="form-control mb-3"
            placeholder="Sinu kommentaar"
          ></textarea>
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
      menuOpen: false,
      showRatingInput: false,
      selectedClass: {},
      userRating: null,
      userComment: "",
      selectedComment: null,
      classes: [
        {
          name: "Matemaatika",
          rating: 4.3,
          comments: [
            { text: "Väga raske, aga õpetlik.", stars: 4 },
            { text: "Õpetaja super!", stars: 5 }
          ]
        },
        {
          name: "Eesti keel",
          rating: 3.9,
          comments: [{ text: "Natuke igav.", stars: 3 }]
        },
        {
          name: "Programmeerimine",
          rating: 4.8,
          comments: [{ text: "Parim tund üldse!", stars: 5 }]
        }
      ]
    };
  },
  mounted() {
  fetch("http://localhost:3000/api/classes")
    .then(res => res.json())
    .then(data => this.classes = data)
    .catch(() => console.error("Failed to load classes"));
  },
  methods: {
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
    const newRating = { text: this.userComment, stars: Number(this.userRating) };

    
    this.selectedClass.comments.push(newRating);

    
    await fetch(`http://localhost:3000/api/classes/${this.selectedClass.name}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRating)
     });
    this.showRatingInput = false;
    this.userRating = null;
    this.userComment = "";
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

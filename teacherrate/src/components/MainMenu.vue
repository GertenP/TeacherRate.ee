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

      <div class="classes col-6 ps-4">
        <h2 class="class-header mb-3 ">Õppeained</h2>

        <div class="class-list" style="background-color: darkgray;">
          <div v-for="cls in classes" :key="cls.id" class="card mb-3 class-card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">{{ cls.name }}</h5>
              <div class="class-rating">
                <img src="../assets/riks.jpeg" alt="" style="max-height: 50px;">
                <span class="me-2">⭐ {{ cls.rating.toFixed(1) }}</span>
                <button class="btn btn-sm btn-primary">Hinda</button>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div class="col-6 ">

      <!-- <h2 style="text-align: center; font-size: 100px;">ELIITHÄKKERID</h2> -->
       
        <img id="elite_gif" src="../assets/text.png" alt="Description of text" />
        <img id="elite_gif" src="../assets/elitehackers.gif" alt="Description of GIF" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainMenu",
  data() {
    return {
      classes: [
        { name: "Matemaatika", rating: 4.3 },
        { name: "Eesti keel", rating: 3.9 },
        { name: "Programmeerimine", rating: 4.8 },
        { name: "Ajalugu", rating: 4.1 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Matemaatika", rating: 4.3 },
        { name: "Eesti keel", rating: 3.9 },
        { name: "Programmeerimine", rating: 4.8 },
        { name: "Ajalugu", rating: 4.1 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 },
        { name: "Bioloogia", rating: 3.7 },
        { name: "Keemia", rating: 4.0 }
      ]
    };
  }
};
</script>

<style>

#elite_gif{
  width: 100%;
}

.class-list {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 8px;
}

.custom-navbar {
  background-color: darkgray;
}

.class-list {
  border: 5px solid black; 
  border-radius: 1rem;      
  padding: 1rem;            
}

.class-header{
  padding-bottom: 1rem;
}
</style>

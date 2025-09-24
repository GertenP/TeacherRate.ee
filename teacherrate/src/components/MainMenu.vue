<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid d-flex align-items-center">
      <button type="button" class="btn btn-danger me-3">Logi välja</button>
      <form class="d-flex flex-grow-1" role="search" style="max-width: 500px;">
        <input class="form-control me-2" type="search" placeholder="Otsi" aria-label="Search"/>
        <button class="btn btn-outline-success" type="submit">Otsi</button>
      </form>
      <h2>Kasutaja</h2>
      <img src="/public/pfp.jpg">
    </div>
  </nav>
</template>


<script>


export default {
  name: "MainMenu"
};


</script>


<template>
  <main class="dex-main about-page">
    <section class="r8-panel about-panel" aria-labelledby="about-title">
      <header class="r8-panel__header about-panel__header">
        <div>
          <span class="dex-kicker">Sobre o projeto</span>
          <h1 id="about-title" class="r8-panel__title">Retrodex</h1>
          <p class="r8-panel__meta">Uma demonstração prática da Retro8 UI.</p>
        </div>
      </header>

      <div class="r8-panel__body about-panel__body">
        <div class="about-copy">
          <h2>Objetivo</h2>
          <p>
            O Retrodex foi criado para demonstrar, em uma aplicação funcional, a utilização da
            <a
              href="https://regiszaum.github.io/retro8-ui/en"
              target="_blank"
              rel="noopener noreferrer"
            >Retro8 UI</a>, uma biblioteca de interfaces com estética retrô 8-bit e classes semânticas.
          </p>
          <p>
            Construído com Nuxt e integrado à PokeAPI, o projeto apresenta componentes, temas,
            responsividade, filtros e comportamentos interativos da biblioteca em um produto coeso,
            acessível e preparado para diferentes tamanhos de tela.
          </p>
        </div>

        <aside class="about-author" aria-labelledby="author-title">
          <span class="dex-kicker">Autoria</span>
          <h2 id="author-title">Régis Adriano</h2>
          <p>
            Frontend Engineer. Conheça outros projetos e acesse os canais profissionais pelos links abaixo.
          </p>
          <div class="about-actions">
            <a
              class="r8-btn r8-btn--primary"
              href="https://github.com/regiszaum"
              target="_blank"
              rel="noopener noreferrer"
            >GitHub</a>
            <a
              class="r8-btn r8-btn--secondary"
              href="https://www.linkedin.com/in/regisadrianofilho/"
              target="_blank"
              rel="noopener noreferrer"
            >LinkedIn</a>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Retrodex - Sobre',
  meta: [
    {
      name: 'description',
      content: 'Conheça o Retrodex, projeto criado para demonstrar a utilização da Retro8 UI com Nuxt.'
    }
  ]
})
</script>

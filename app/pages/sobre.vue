<template>
  <main class="dex-main about-page">
    <section class="r8-panel about-panel" aria-labelledby="about-title">
      <header class="r8-panel__header about-panel__header">
        <div>
          <span class="dex-kicker">{{ t('about.kicker') }}</span>
          <h1 id="about-title" class="r8-panel__title">Retrodex</h1>
          <p class="r8-panel__meta">{{ t('about.tagline') }}</p>
        </div>
      </header>

      <div class="r8-panel__body about-panel__body">
        <div class="about-copy">
          <h2>{{ t('about.goal') }}</h2>
          <p>
            {{ t('about.goalBeforeLink') }}
            <a
              href="https://regiszaum.github.io/retro8-ui/en"
              target="_blank"
              rel="noopener noreferrer"
            >Retro8 UI</a>{{ t('about.goalAfterLink') }}
          </p>
          <p>{{ t('about.description') }}</p>
        </div>

        <aside class="about-author" aria-labelledby="author-title">
          <span class="dex-kicker">{{ t('about.authorship') }}</span>
          <div class="about-author__identity">
            <span
              class="r8-avatar r8-avatar--lg r8-avatar--round"
              data-r8-avatar-fallback="RA"
            >
              <img
                src="https://avatars.githubusercontent.com/u/67252983?v=4"
                :alt="t('about.authorAvatarAlt')"
                width="64"
                height="64"
              >
            </span>
            <h2 id="author-title">Régis Adriano</h2>
          </div>
          <p>{{ t('about.authorDescription') }}</p>
          <div class="about-actions">
            <a
              class="r8-btn r8-btn--primary"
              href="https://github.com/regiszaum"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PixelIcon class="r8-btn__icon" name="user" />
              GitHub
            </a>
            <a
              class="r8-btn r8-btn--secondary"
              href="https://github.com/regiszaum/pokeapp-with-retro8-ui"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PixelIcon class="r8-btn__icon" name="git-branch" />
              {{ t('about.repository') }}
            </a>
            <a
              class="r8-btn r8-btn--secondary"
              href="https://www.linkedin.com/in/regisadrianofilho/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PixelIcon class="r8-btn__icon" name="briefcase" />
              LinkedIn
            </a>
          </div>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { t } = useAppI18n()

useHead(() => ({
  title: `Retrodex - ${t('nav.about')}`,
  meta: [
    {
      name: 'description',
      content: t('about.metaDescription')
    }
  ]
}))
</script>

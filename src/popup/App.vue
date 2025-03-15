<template>
  <div id="main-container">
    <transition name="fade">
      <router-view/>
    </transition>
  </div>
</template>

<script>
import themesApi from "@/api/themes-api"
import chromeStorageApi from '@/api/chrome-storage'

export default {
  name: 'App',
  created: function() {
    themesApi.restoreCurrTheme();
    themesApi.setOnThemeChanged();

    // Check if this is the first run after migration
    this.checkFirstRun();
  },
  methods: {
    checkFirstRun() {
      // TEMPORARY: For testing - log the check
      console.log('Checking if this is first run after migration...');

      chromeStorageApi.checkFirstRun()
        .then((migrated) => {
          // TEMPORARY: For testing - log the result
          console.log('Migration flag check result:', migrated ? 'Already migrated' : 'First run');

          if (!migrated) {
            // This is the first run after migration
            console.log('First run detected, checking for packs...');

            chromeStorageApi.getPacks()
              .then((packs) => {
                console.log(`Found ${packs.length} packs in storage`);

                if (packs && packs.length > 0) {
                  // If we have packs, ask if the user wants to back up
                  console.log('Showing welcome dialog...');

                  if (confirm('Welcome back to Packr! Would you like to create a backup of your packs?')) {
                    console.log('User accepted backup, exporting packs...');
                    chromeStorageApi.exportPacks();
                  } else {
                    console.log('User declined backup');
                  }
                } else {
                  console.log('No packs found, skipping backup dialog');
                }

                // Mark migration as complete regardless of user's choice
                console.log('Setting migration flag to true');
                chromeStorageApi.setMigrationComplete();
              });
          }
        });
    }
  }
}
</script>

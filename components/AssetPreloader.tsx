import { useEffect } from 'react';

/**
 * Preloads critical assets to reduce lag when switching pages
 */
export default function AssetPreloader() {
  useEffect(() => {
    // Preload videos
    const videoUrls = [
      // Demo screen
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/demo-open.mp4?alt=media&token=9b2aa131-210f-459d-9e48-855aa4ea2c49',
      // Intro video
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/final-intro-video.mp4?alt=media&token=a1011d0e-6617-43bb-be03-cc2a7c96b13b',
      // Home page
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/home-final-bounce.webm?alt=media&token=a071ecb1-805b-42dd-9adb-995c16a16319',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/fireplace.webm?alt=media&token=317be10b-205f-48f8-b8a2-cd6efc229c72',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/clouds-window-day.webm?alt=media&token=ace13dae-be04-4c15-a5ba-87a7ededf071',
      // Missions page
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/lights.webm?alt=media&token=0a6e40eb-df96-4d73-8ddd-70a53a702784',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/missions%20fighting.webm?alt=media&token=5d97a1c6-1795-442b-8f5f-1dcecf60a0ab',
      // Nemesis page
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis-cocky.webm?alt=media&token=7b486f18-bbff-43dd-ace7-6713bec082f5',
      // Legacy
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/walking.webm?alt=media&token=34912a19-e256-447b-bb26-203c1d8903cf',
      '/assets/gnome-icon.webm',
    ];

    // Preload images
    const imageUrls = [
      // Home page background
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/home%20background%202.png?alt=media&token=bd1ec79c-cb27-42d5-bd60-ce9e8bf7a19c',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/window2.png?alt=media&token=7900fbbf-68d8-4cfc-97ce-38b04ae14e20',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/dart%20side.png?alt=media&token=52f73d19-7c59-4fed-9405-5688c804bb49',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/bubble%20(1).png?alt=media&token=94383913-2f03-4aab-a0f5-cd967931ec7d',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/flower%20(1).png?alt=media&token=af1a559d-e037-4ae1-a68a-0e0c7e7aaf68',
      // Nemesis page
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis%20background%20(1).png?alt=media&token=46f4d50b-1ba7-4806-963d-d6635f6ff66f',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis%20award.png?alt=media&token=823cc19e-13b8-4953-ab13-42635e1ca46d',
      // Morning Ritual Onboarding
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/morning%20ritual%20onboarding%20(1).png?alt=media&token=b7ca5283-17c4-4ed6-8dbe-077438f108e9',
      // Navigation icons
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/home.png?alt=media&token=fe198be7-81f8-4d2b-b7da-85bd41ad5c4f',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/missions.png?alt=media&token=e53ddfc0-b29e-4c59-adc1-3f6e8941934a',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis.png?alt=media&token=da2d84f8-e97f-425d-a95a-5de690caeb5c',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/shop-icon.png?alt=media&token=4edad559-b97d-4329-8a77-542ca67c753c',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/slappy-profile.png?alt=media&token=4419207e-d610-4162-9db1-802bf6587dfe',
      // Other icons and assets
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/menu-icon.png?alt=media&token=4e703bed-7e09-49f1-b663-386ba7513c7c',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/2.png?alt=media&token=b29ad6ed-6740-486f-8496-9b9f1ce2fe0b',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/3.png?alt=media&token=95ff6fbc-1d56-49e9-8c02-75178d6c0b1d',
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/4.png?alt=media&token=abe247c7-34c8-465f-8c14-e4b512b0eb8b',
      // Local assets
      '/assets/mushroom-icon.png',
      '/assets/mushroom-house-overlay.png',
      '/assets/bg-home-static.png',
    ];

    // Preload videos
    videoUrls.forEach((url) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = url;
      video.muted = true;
      video.load();
    });

    // Preload images
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    // Preload audio
    const audioUrls = [
      // Intro video background music
      'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/intro-song.mp3?alt=media&token=33fbc6d1-d787-4946-bc9f-04e22dcd86ac',
    ];

    audioUrls.forEach((url) => {
      const audio = document.createElement('audio');
      audio.preload = 'auto';
      audio.src = url;
      audio.load();
    });
  }, []);

  return null;
}


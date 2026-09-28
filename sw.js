self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        'index.html',
        'app.js',
        'manifest.json',
        'bkp.jpeg',
        // Tambahkan path foto siswa di sini jika perlu di-cache offline:
        'isco.jpg',
        'akmal.jpeg', 
        'alex.jpeg ',
        'alexap.jpeg',
        'arez.jpeg',
        'awan.jpg', 
        'enjul.jpeg',
        'idan.jpeg',
        'isal.jpeg', 
        'juan.jpeg', 
        'kodel.jpeg',
        'oom.jpeg', 
        'opan.jpeg', 
        'rafli.jpeg',
        'aul.jpeg',
        'isbat.jpeg',
        'rafi.jpeg',
        'mei.jpeg',
        'rich.jpeg',
      ]);
    })
  );
});
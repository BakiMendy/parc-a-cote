// Fonction utilitaire pour obtenir une URL d'image valide
export function getValidImageUrl(
  images: { url: string }[] | undefined, 
  index: number = 0, 
  fallback: string = 'https://source.unsplash.com/random/800x600/?playground'
): string {
  if (!images || images.length === 0 || !images[index] || !images[index].url) {
    return fallback;
  }
  
  // Vérifier si l'URL est valide
  const url = images[index].url;
  
  // Si l'URL est relative, la convertir en URL absolue
  if (url.startsWith('/')) {
    return window.location.origin + url;
  }
  
  // Si l'URL ne commence pas par http ou https, utiliser l'image de secours
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return fallback;
  }
  
  // Ajouter un paramètre aléatoire pour éviter la mise en cache
  return url + (url.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
}

// Fonction pour générer une URL d'image aléatoire depuis Unsplash
export function getRandomImageUrl(
  category: string | string[] = 'playground', 
  uniqueId?: string
): string {
  const categories = Array.isArray(category) ? category : [category];
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const id = uniqueId || Date.now().toString() + Math.floor(Math.random() * 10000);
  
  // Ajouter un paramètre nocache pour éviter la mise en cache
  return `https://source.unsplash.com/random/800x600/?${selectedCategory}&sig=${id}&nocache=${Date.now()}`;
}

// Fonction pour précharger une image
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Fonction pour précharger plusieurs images
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => preloadImage(url));
  await Promise.all(promises);
}

// Fonction pour charger des images en séquence (pour éviter de surcharger le réseau)
export async function preloadImagesSequentially(urls: string[], batchSize: number = 3): Promise<void> {
  const batches = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    await Promise.all(batch.map(url => preloadImage(url)));
  }
}

// Fonction pour obtenir une image de secours avec un identifiant unique
export function getFallbackImageUrl(id: string, category: string = 'playground'): string {
  return `https://source.unsplash.com/random/800x600/?${category}&sig=${id}&nocache=${Date.now()}`;
}
// api_client.js

export async function saveStatsToBackend(stats) {
    try {
      const response = await fetch('/api/save-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });
      
      if (response.ok) {
        console.log("💾 Stats sauvegardées");
        return true;
      } else {
        const err = await response.json();
        console.warn("⚠️ Erreur sauvegarde (serveur):", err);
        return false;
      }
    } catch (e) {
      console.warn("⚠️ Erreur sauvegarde (réseau):", e);
      return false;
    }
}

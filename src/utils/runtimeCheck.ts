// Simple runtime check to warn if any API calls would end up with /undefined/ in the path
// Import this once in your root layout or providers if you want the warning in dev.

(function runtimeUndefinedBaseGuard(){
  if (typeof window === 'undefined') return; // only client side
  // Scan existing script/network tags heuristically after load
  window.addEventListener('load', ()=>{
    // If any link/script tag with src contains /undefined/api we warn.
    const offender = Array.from(document.querySelectorAll('script,link,img,video,source'))
      .map(el => (el as HTMLScriptElement).src || (el as HTMLImageElement).currentSrc || '')
      .find(src => src.includes('/undefined/api/'));
    if (offender) {
      console.warn('[runtimeCheck] Detected asset referencing /undefined/api/. Check NEXT_PUBLIC_API_BASE_URL.');
    }
  });
})();

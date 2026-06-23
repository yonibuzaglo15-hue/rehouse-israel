export const THEME_STORAGE_KEY = "theme";

export type ThemeMode = "light" | "dark";

/**
 * Returns the default theme based on Israel local time (Asia/Jerusalem).
 * Day: 06:00–17:59 → light | Night: 18:00–05:59 → dark
 */
export function getIsraelThemeDefault(): ThemeMode {
  try {
    const hour = parseInt(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Jerusalem",
      }).format(new Date()),
      10
    );

    return hour >= 6 && hour < 18 ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/**
 * Blocking script — runs before paint to prevent theme flash.
 * Respects saved preference in localStorage; otherwise uses Israel time.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k='theme';var s=localStorage.getItem(k);var t;if(s==='light'||s==='dark'){t=s;}else{var h=parseInt(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:'Asia/Jerusalem'}).format(new Date()),10);t=(h>=6&&h<18)?'light':'dark';}var el=document.documentElement;if(t==='dark'){el.classList.add('dark');}else{el.classList.remove('dark');}}catch(e){}})();`;

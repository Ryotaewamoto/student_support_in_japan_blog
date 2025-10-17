"use client";

import styles from "./switch.module.css";
// 💡 修正点: useRef をインポート
import { memo, useEffect, useState, useRef } from "react";

// ❌ 削除: グローバルな型定義を削除
// declare global {
//   var updateDOM: () => void;
// }

// 💡 追加: window.updateDOM の型を安全に定義
declare global {
  interface Window {
    updateDOM: (() => void) | undefined;
  }
}

type ColorSchemePreference = "system" | "dark" | "light";

const STORAGE_KEY = "nextjs-blog-starter-theme";
const modes: ColorSchemePreference[] = ["system", "dark", "light"];

/** function to be injected in script tag for avoiding FOUC (Flash of Unstyled Content) */
export const NoFOUCScript = (storageKey: string) => {
  /* can not use outside constants or function as this script will be injected in a different context */
  const [SYSTEM, DARK, LIGHT] = ["system", "dark", "light"];

  /** Modify transition globally to avoid patched transitions */
  const modifyTransition = () => {
    const css = document.createElement("style");
    css.textContent = "*,*:after,*:before{transition:none !important;}";
    document.head.appendChild(css);

    return () => {
      /* Force restyle */
      getComputedStyle(document.body);
      /* Wait for next tick before removing */
      setTimeout(() => document.head.removeChild(css), 1);
    };
  };

  const media = matchMedia(`(prefers-color-scheme: ${DARK})`);

  /** function to add remove dark class */
  // window.updateDOM が定義される
  window.updateDOM = () => {
    const restoreTransitions = modifyTransition();
    const mode = localStorage.getItem(storageKey) ?? SYSTEM;
    const systemMode = media.matches ? DARK : LIGHT;
    const resolvedMode = mode === SYSTEM ? systemMode : mode;
    const classList = document.documentElement.classList;
    if (resolvedMode === DARK) classList.add(DARK);
    else classList.remove(DARK);
    document.documentElement.setAttribute("data-mode", mode);
    restoreTransitions();
  };
  window.updateDOM();
  media.addEventListener("change", window.updateDOM);
};

// ❌ 削除: グローバルな変数宣言を削除
// let updateDOM: () => void; 

/**
 * Switch button to quickly toggle user preference.
 */
const Switch = () => {
  const [mode, setMode] = useState<ColorSchemePreference>(
    () =>
      ((typeof localStorage !== "undefined" &&
        localStorage.getItem(STORAGE_KEY)) ??
        "system") as ColorSchemePreference,
  );
  
  // 💡 修正点: useRefを使ってupdateDOMへの参照を保持する
  const updateDOMRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // 💡 修正点: window.updateDOMをuseEffect内で安全に取得し、refに格納する
    if (typeof window !== "undefined" && window.updateDOM) {
      updateDOMRef.current = window.updateDOM;
    }

    /** Sync the tabs */
    const storageHandler = (e: StorageEvent): void => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setMode(e.newValue as ColorSchemePreference);
      }
    };
    addEventListener("storage", storageHandler);
    
    return () => {
      removeEventListener("storage", storageHandler);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    
    // 💡 修正点: ref経由で関数を呼び出す。ref.currentが定義されているかチェックする。
    if (updateDOMRef.current) {
      updateDOMRef.current();
    }
  }, [mode]);

  /** toggle mode */
  const handleModeSwitch = () => {
    const index = modes.indexOf(mode);
    setMode(modes[(index + 1) % modes.length]);
  };
  
  return (
    <button
      suppressHydrationWarning
      className={styles.switch}
      onClick={handleModeSwitch}
    />
  );
};

const Script = memo(() => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(${NoFOUCScript.toString()})('${STORAGE_KEY}')`,
    }}
  />
));

/**
 * This component wich applies classes and transitions.
 */
export const ThemeSwitcher = () => {
  return (
    <>
      <Script />
      <Switch />
    </>
  );
};
/*
 * Buildless page enhancements; safe to open directly through file://.
 * Motion uses #video-background with a <source data-src="…"> and
 * #motion-toggle [data-motion-label]. No video is requested until enabled.
 * The root data-motion/data-video attributes describe actual playback.
 * #toast is an aria-live status region for playback errors.
 * The video control stays hidden without JavaScript.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const toast = document.getElementById("toast");
  let toastTimer;
  let toastFrame;

  function announce(message) {
    if (!toast) return;
    clearTimeout(toastTimer);
    cancelAnimationFrame(toastFrame);
    toast.textContent = "";
    toast.dataset.visible = "true";
    // Clearing first lets assistive technology announce repeated messages.
    toastFrame = requestAnimationFrame(() => {
      toast.textContent = message;
      toastTimer = setTimeout(() => {
        delete toast.dataset.visible;
      }, 4500);
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const video = document.getElementById("video-background");
  const motionButton = document.getElementById("motion-toggle");
  const motionLabel = motionButton?.querySelector("[data-motion-label]");

  root.dataset.motion = "off";
  root.dataset.video = "poster";

  if (video && motionButton && motionLabel) {
    const storageKey = "alby08.motion";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 767px)");
    const connection = navigator.connection;
    let savedPreference = null;

    try {
      savedPreference = localStorage.getItem(storageKey);
    } catch {
      // Private browsing and file:// may make storage unavailable.
    }

    let desiredMotion = savedPreference !== "off";
    let enabledThisSession = false;
    let sourcesLoaded = false;
    let starting = false;
    let playing = false;
    let failed = false;
    let playbackRequest = 0;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;

    function rememberPreference(enabled) {
      try {
        localStorage.setItem(storageKey, enabled ? "on" : "off");
      } catch {
        // The control still works when preferences cannot be saved.
      }
    }

    function canRun() {
      const environmentAllowsMotion = !reducedMotion.matches
        && !smallScreen.matches
        && !connection?.saveData;
      return desiredMotion
        && !document.hidden
        && (enabledThisSession || environmentAllowsMotion);
    }

    function renderMotionState() {
      const active = playing && !video.paused && canRun();
      motionButton.setAttribute("aria-pressed", String(active));
      motionLabel.textContent = active ? "Pause video"
        : starting ? "Cancel loading"
        : failed ? "Retry video"
        : "Play video";
      motionButton.setAttribute("aria-busy", String(starting));
      root.dataset.motion = active ? "on" : "off";
      root.dataset.video = active ? "ready" : "poster";
    }

    function pauseMotion() {
      // Invalidate unresolved play() promises without changing user intent.
      playbackRequest += 1;
      starting = false;
      playing = false;
      video.pause();
      renderMotionState();
    }

    function playbackFailed(error) {
      if (!canRun()) return;
      desiredMotion = false;
      failed = true;
      pauseMotion();
      announce(error?.name === "NotAllowedError"
        ? "Your browser blocked playback. Select Retry video to try again."
        : "The video couldn’t play. Showing the still image.");
    }

    async function startMotion() {
      if (!canRun() || starting || (playing && !video.paused)) return;

      const request = ++playbackRequest;
      starting = true;
      failed = false;
      renderMotionState();

      try {
        if (!sourcesLoaded) {
          const sources = video.querySelectorAll("source[data-src]");
          if (!sources.length) throw new Error("The motion background is unavailable.");
          for (const source of sources) source.src = source.dataset.src;
          sourcesLoaded = true;
          video.load();
        } else if (video.error || video.networkState === 3) {
          // A deliberate retry can recover a previously failed file request.
          video.load();
        }

        await video.play();

        if (request !== playbackRequest) return;
        if (!canRun()) {
          pauseMotion();
          return;
        }

        starting = false;
        playing = !video.paused;
        renderMotionState();
      } catch (error) {
        // A pause, visibility change, or newer play request supersedes this one.
        if (request === playbackRequest) playbackFailed(error);
      }
    }

    function reconcileMotion() {
      if (canRun()) startMotion();
      else pauseMotion();
    }

    video.addEventListener("playing", () => {
      if (!canRun()) {
        pauseMotion();
        return;
      }
      starting = false;
      playing = true;
      renderMotionState();
    });

    video.addEventListener("pause", () => {
      // Ignore a queued pause event from an earlier request if play has resumed.
      if (!video.paused) return;
      playing = false;
      renderMotionState();
    });

    video.addEventListener("error", () => playbackFailed(video.error));
    for (const source of video.querySelectorAll("source[data-src]")) {
      source.addEventListener("error", () => playbackFailed(video.error));
    }

    motionButton.addEventListener("click", () => {
      const enable = !(playing || starting);
      desiredMotion = enable;
      enabledThisSession = enable;
      failed = false;
      rememberPreference(enable);
      reconcileMotion();
    });

    document.addEventListener("visibilitychange", reconcileMotion);
    window.addEventListener("pagehide", pauseMotion);
    window.addEventListener("pageshow", reconcileMotion);

    // A saved desktop preference never silently overrides reduced motion,
    // Save-Data, or a small screen. An explicit play click can override them.
    reducedMotion.addEventListener("change", reconcileMotion);
    smallScreen.addEventListener("change", reconcileMotion);
    connection?.addEventListener?.("change", reconcileMotion);

    motionButton.hidden = false;
    renderMotionState();
    reconcileMotion();
  }
})();

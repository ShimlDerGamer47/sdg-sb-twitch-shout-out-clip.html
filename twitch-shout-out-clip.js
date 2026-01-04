document.addEventListener("DOMContentLoaded", function DomContentLoaded() {
  console.log("🚀 Script startet...");

  try {
    const currentDomain = window.location.hostname || "localhost";
    console.log("🌐 Domain erkannt:", currentDomain);

    const params = new URLSearchParams(location.search);
    console.log("📋 URL Parameter:", {
      host: params.get("host"),
      port: params.get("port"),
      endpoint: params.get("endpoint"),
      hasPassword: !!params.get("password"),
    });

    const client = new StreamerbotClient({
      host: params.get("host"),
      port: parseInt(params.get("port"), 10),
      endpoint: params.get("endpoint"),
      password: params.get("password"),
      autoReconnect: true,
      immediate: true,
    });

    const html = document.documentElement;
    const body = document.body;

    const fontFamilyVar = "--font-family-var";
    const robotoBold = getComputedStyle(html)
      .getPropertyValue(fontFamilyVar)
      .trim();

    const copy = "copy";
    const dragstart = "dragstart";
    const keydown = "keydown";
    const select = "select";

    const none = "none";
    const def = "default";

    (function bodyToken() {
      const eventArray = [copy, dragstart, keydown, select];
      eventArray.forEach((event) => {
        if (!event) return;
        body.addEventListener(event, (e) => e.preventDefault());
      });

      if (robotoBold) {
        Object.assign(body.style, {
          fontFamily: robotoBold,
          webkitUserSelect: none,
          userSelect: none,
          cursor: def,
        });
      }
    })();

    const $ = (id) =>
      document.getElementById(id) || document.querySelector("#" + id);

    const twitchSoClipDiv = $("twitchSoClipContainerId");
    const twitchShoutOutClip = $("twitchShoutOutClipId");

    console.log("🎯 DOM Elements gefunden:", {
      twitchSoClipDiv: !!twitchSoClipDiv,
      twitchShoutOutClip: !!twitchShoutOutClip,
    });

    if (twitchSoClipDiv && twitchShoutOutClip) {
      twitchShoutOutClip.src = "";
      twitchShoutOutClip.setAttribute("loading", "eager");
      console.log("✅ iframe initialisiert");
    } else {
      console.error("❌ DOM Elements nicht gefunden!");
    }

    (function twitchSoSecurityToken() {
      const eventArray = [copy, dragstart, keydown, select];
      [twitchSoClipDiv, twitchShoutOutClip].forEach((element) => {
        if (!element) return;

        eventArray.forEach((event) => {
          if (!event) return;
          element.addEventListener(event, (e) => e.preventDefault());
        });

        if (robotoBold) {
          Object.assign(element.style, {
            fontFamily: robotoBold,
            webkitUserSelect: none,
            userSelect: none,
            cursor: def,
          });
        }
      });
    })();

    let clipTimeout = null;

    client.on("StreamElements.Connected", (data) => {
      console.log("✅ StreamElements verbunden", data);
    });

    client.on("Twitch.ShoutoutCreated", (data) => {
      console.log("📢 Twitch Shout-Out erstellt:", data);
    });

    client.on("Misc.GlobalVariableUpdated", (event) => {
      console.log("📊 Global Variable Update empfangen:", event);

      const data = event.data || event;
      console.log("📦 Variable Name:", data.name);
      console.log("📦 Variable Value:", data.newValue);

      if (data.name === "twitchShoutOutUserClipId") {
        try {
          let clipId = data.newValue;

          if (typeof clipId === "string" && clipId.startsWith("{")) {
            clipId = JSON.parse(clipId);
          }

          console.log("🎬 Clip-ID verarbeitet:", clipId);

          if (clipId && clipId !== "" && twitchShoutOutClip) {
            if (clipTimeout) {
              clearTimeout(clipTimeout);
              clipTimeout = null;
            }

            const embedUrl = `https://clips.twitch.tv/embed?clip=${clipId}&parent=${currentDomain}&autoplay=true&muted=false`;
            twitchShoutOutClip.src = embedUrl;
            console.log("▶️ Clip wird geladen:", embedUrl);
          } else if (!clipId || clipId === "") {
            console.log("⏹️ Keine/Leere Clip-ID - iframe wird geleert");
            if (twitchShoutOutClip) {
              twitchShoutOutClip.src = "";
            }
          }
        } catch (error) {
          console.error("❌ Fehler bei ClipId:", error);
        }
      }

      if (data.name === "twitchClipTime") {
        try {
          let clipDuration = data.newValue;

          if (typeof clipDuration === "string") {
            clipDuration = parseInt(clipDuration, 10);
          }

          console.log("⏱️ Clip-Duration verarbeitet:", clipDuration + "ms");

          if (clipDuration > 0) {
            if (clipTimeout) {
              clearTimeout(clipTimeout);
            }

            clipTimeout = setTimeout(() => {
              if (twitchShoutOutClip) {
                console.log(
                  "⏹️ Clip-Duration abgelaufen - iframe wird geleert"
                );
                twitchShoutOutClip.src = "";
              }
              clipTimeout = null;
            }, clipDuration);

            console.log(`⏳ Clip wird in ${clipDuration}ms gestoppt`);
          }
        } catch (error) {
          console.error("❌ Fehler bei Clip-Duration:", error);
        }
      }
    });

    client.on("Open", () => {
      console.log("🔌 Streamer.bot WebSocket VERBUNDEN");
    });

    client.on("Close", () => {
      console.log("🔌 Streamer.bot WebSocket GETRENNT");
    });

    client.on("Error", (error) => {
      console.error("❌ WebSocket Fehler:", error);
    });

    window.addEventListener("beforeunload", () => {
      if (clipTimeout) {
        clearTimeout(clipTimeout);
      }
      if (client) {
        client.disconnect();
      }
    });

    console.log("✅ Twitch Shout-Out Clip Script vollständig initialisiert");
  } catch (error) {
    console.error("❌ KRITISCHER FEHLER:", error);
    console.error("Stack Trace:", error.stack);
  }
});

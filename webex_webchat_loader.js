class LiveChatLoader {
  constructor({
    containerId = "divicw",
    scriptUrl = "https://attachuk.imi.chat/widget/js/imichatinit.js"
  } = {}) {
    this.containerId = containerId;
    this.scriptUrl = scriptUrl;
    this.iframeId = "tls_al_frm";

    this.handleMessage = this.handleMessage.bind(this);
  }

  init() {
    try {
      const container = document.getElementById(this.containerId);

      if (!container) {
        console.warn(`[LiveChatLoader] Container #${this.containerId} not found.`);
        return;
      }

      const script = document.createElement("script");
      script.src = `${this.scriptUrl}?t=${new Date().toISOString()}`;
      script.async = true;

      script.addEventListener("load", () => {
        console.log(
          new Date().toISOString(),
          "LiveChat script loaded successfully."
        );
      });

      script.addEventListener("error", () => {
        console.error(
          new Date().toISOString(),
          "Error loading LiveChat script."
        );
        this.showFallback(container);
      });

      container.insertAdjacentElement("afterend", script);

    } catch (error) {
      console.error("[LiveChatLoader] Unexpected error:", error);
    }
  }

  showFallback(container) {
    if (document.getElementById(this.iframeId)) return;

    const iframe = document.createElement("iframe");
    iframe.id = this.iframeId;

    iframe.style.cssText = `
      overflow: hidden;
      height: 208px;
      width: 394px;
      position: fixed;
      right: 48px;
      bottom: 12px;
      z-index: 99999;
      border: 0;
    `;

    iframe.srcdoc = this.getFallbackHTML();

    container.insertAdjacentElement("afterend", iframe);

    window.addEventListener("message", this.handleMessage);
  }

  handleMessage(event) {
    if (
      event.origin === window.location.origin &&
      event.data?.action === "close_tls_alert"
    ) {
      this.removeFallback();
    }
  }

  removeFallback() {
    const iframe = document.getElementById(this.iframeId);
    if (iframe) iframe.remove();
    window.removeEventListener("message", this.handleMessage);
  }

  getFallbackHTML() {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont,
                           "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #99a0b0;
              font-size: 14px;
              margin: 0;
              padding: 1rem;
              background: #fff;
            }
            .popover {
              background: #fbfbfe;
              padding: 1.5rem;
              border-radius: 6px;
              width: 300px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              position: relative;
            }
            .title {
              font-weight: 600;
              color: #56627c;
              font-size: 16px;
              margin-bottom: 0.75rem;
            }
            .close-btn {
              position: absolute;
              right: 12px;
              top: 12px;
              cursor: pointer;
              font-size: 16px;
              background: none;
              border: none;
              color: #56627c;
            }
          </style>
        </head>
        <body>
          <div class="popover">
            <button class="close-btn" onclick="closeTLSAlert()">✕</button>
            <div class="title">
              This browser version is not supported on LiveChat.
            </div>
            <p>
              Please update your browser to the latest version and re-open the website to access the widget.
            </p>
          </div>

          <script>
            function closeTLSAlert() {
              window.parent.postMessage(
                { action: "close_tls_alert" },
                "${window.location.origin}"
              );
            }
          <\/script>
        </body>
      </html>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const liveChat = new LiveChatLoader();
  liveChat.init();
});

/* Optional export if used as module */
export default LiveChatLoader;

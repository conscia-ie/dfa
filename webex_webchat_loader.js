class LiveChatLoader {
  constructor({
    containerId = "divicw",
    scriptBaseUrl = "https://attachuk.imi.chat/widget/js/imichatinit.js",
    allowedOrigin = window.location.origin
  } = {}) {
    this.containerId = containerId;
    this.scriptBaseUrl = scriptBaseUrl;
    this.allowedOrigin = allowedOrigin;

    this.handleMessage = this.handleMessage.bind(this);
  }

  init() {
    try {
      const container = document.getElementById(this.containerId);
      if (!container) {
        console.warn(`Container #${this.containerId} not found.`);
        return;
      }

      const script = document.createElement("script");
      script.src = `${this.scriptBaseUrl}?t=${new Date().toISOString()}`;
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
      console.error("LiveChatLoader error:", error);
    }
  }

  showFallback(container) {
    if (document.getElementById("tls_al_frm")) return;

    const iframe = document.createElement("iframe");
    iframe.id = "tls_al_frm";
    iframe.style.cssText = `
      overflow:hidden;
      height:208px;
      width:394px;
      position:fixed;
      right:48px;
      bottom:12px;
      z-index:99999;
      border:0;
    `;

    container.insertAdjacentElement("afterend", iframe);

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(this.getFallbackHTML());
    doc.close();

    window.addEventListener("message", this.handleMessage);
  }

  handleMessage(event) {
    if (
      event.origin === this.allowedOrigin &&
      event.data?.action === "close_tls_alert"
    ) {
      this.removeFallback();
    }
  }

  removeFallback() {
    const iframe = document.getElementById("tls_al_frm");
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
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
              position: relative;
            }
            .title {
              font-weight: 600;
              font-size: 16px;
              color: #56627c;
              margin-bottom: 0.75rem;
            }
            .close {
              position: absolute;
              right: 12px;
              top: 12px;
              cursor: pointer;
              font-size: 16px;
              color: #56627c;
              background: none;
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="popover">
            <button class="close" onclick="closeTLSAlert()">✕</button>
            <div class="title">
              This browser version is not supported on LiveChat.
            </div>
            <p>
              Please update your browser to the latest version and reopen the website to access the widget.
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

const liveChat = new LiveChatLoader();
liveChat.init();

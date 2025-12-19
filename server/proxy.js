import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors({ origin: true, credentials: true }));

app.get("/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    const deviceType = req.query.deviceType || 'desktop';

    if (!targetUrl) {
      return res.status(400).send("url query param is required");
    }

    let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
    if (deviceType === 'mobile') {
        userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
    }

    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": userAgent,
        "Cookie": req.headers.cookie || "",
        "Referer": new URL(targetUrl).origin
      },
      redirect: 'follow'
    });

    // Handle Cookies
    const rawSetCookie = upstream.headers.raw()['set-cookie'];
    if (rawSetCookie) {
        const processedCookies = rawSetCookie.map(c => 
            c.replace(/Domain=[^;]+;?/i, '').replace(/Secure;?/i, '').replace(/SameSite=[^;]+;?/i, '')
        );
        res.setHeader('Set-Cookie', processedCookies);
    }

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      let html = await upstream.text();
      const urlObj = new URL(targetUrl);
      const origin = urlObj.origin;

      const baseTag = `<base href="${origin}/">`;
      const styleTag = `
        <style>
         ::-webkit-scrollbar { display: none; } 
         body { -ms-overflow-style: none; scrollbar-width: none; }
        </style>`;

      // --- UPDATED SCRIPT FOR DIRECT URLs ---
      const hijackScript = `
      <script>
        (function() {
          const PROXY_BASE = '${process.env.BASE_URL}/proxy'; 
          
          function updateParent(url) {
            try {
               // Send the RAW url (not encoded)
               window.parent.postMessage({ type: 'URL_CHANGE', url: url }, '*');
            } catch(e) {}
          }

          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
              e.preventDefault();
              
              const targetUrl = link.href;

              if(targetUrl.startsWith('javascript:') || targetUrl.startsWith('#') || targetUrl.startsWith('mailto:')) {
                  return; 
              }

              // DIRECT URL SETTING (No encodeURIComponent)
              // We append it directly. Note: This assumes targetUrl has no '&' meant for the proxy.
              const newProxyUrl = PROXY_BASE + '?url=' + targetUrl;
              
              window.location.href = newProxyUrl;
              updateParent(targetUrl);
            }
          }, true);

          document.addEventListener('submit', function(e) {
            const form = e.target;
            e.preventDefault();
            const action = form.getAttribute('action') || '';
            const resolvedAction = new URL(action, '${origin}').href;
            
            // DIRECT URL SETTING
            window.location.href = PROXY_BASE + '?url=' + resolvedAction;
          }, true);
        })();
      </script>`;

      if (html.includes("<head")) {
        html = html.replace("<head>", `<head>${baseTag}${styleTag}${hijackScript}`);
      } else {
        html = `${baseTag}${styleTag}${hijackScript}` + html;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    res.setHeader("Content-Type", contentType);
    const buffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(buffer));

  } catch (err) {
    // console.error("Proxy Error:", err.message);
    res.status(500).send("Proxy Error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Proxy running on ${process.env.BASE_URL}`);
});
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

      const baseTag = `<base href="${targetUrl}">`;
      const styleTag = `
        <style>
         ::-webkit-scrollbar { display: none; } 
         body { -ms-overflow-style: none; scrollbar-width: none; }
        </style>`;

      const hijackScript = `
      <script>
        (function() {
          const PROXY_BASE = '${process.env.BASE_URL}/proxy'; 
          const CURRENT_URL = '${targetUrl}';
          const CURRENT_ORIGIN = '${origin}';
          
          // Store path segment in sessionStorage for this origin
          let storedSegment = sessionStorage.getItem('pathSegment_' + CURRENT_ORIGIN);
          
          function updateParent(url, previousUrl) {
            try {
               window.parent.postMessage({ 
                 type: 'URL_CHANGE', 
                 url: url,
                 previousUrl: previousUrl || CURRENT_URL
               }, '*');
            } catch(e) {}
          }

          function navigateToUrl(targetUrl) {
            try {
              const resolvedUrl = new URL(targetUrl, CURRENT_URL).href;
              const newProxyUrl = PROXY_BASE + '?url=' + resolvedUrl;
              
              updateParent(resolvedUrl, CURRENT_URL);
              
              setTimeout(() => {
                window.location.href = newProxyUrl;
              }, 10);
            } catch(e) {
              console.error('Navigation error:', e);
            }
          }

          // Store path segment when navigating away from deeper pages
          function storePathSegment(url) {
            try {
              const urlObj = new URL(url);
              if (urlObj.origin === CURRENT_ORIGIN) {
                const pathSegments = urlObj.pathname.split('/').filter(s => s);
                if (pathSegments.length > 0) {
                  const firstSegment = pathSegments[0];
                  sessionStorage.setItem('pathSegment_' + CURRENT_ORIGIN, firstSegment);
                  storedSegment = firstSegment;
                }
              }
            } catch(e) {}
          }

          // Intercept ALL link clicks
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              let targetUrl = link.href;

              if(targetUrl.startsWith('javascript:') || 
                 targetUrl.startsWith('#') || 
                 targetUrl.startsWith('mailto:') ||
                 targetUrl.startsWith('tel:')) {
                  return; 
              }

              // Check if this is a "back to base" navigation
              try {
                const targetUrlObj = new URL(targetUrl);
                const currentUrlObj = new URL(CURRENT_URL);
                
                // If going from a deep page (e.g., /flower-garden/blog/987) to base (/)
                if (targetUrlObj.origin === currentUrlObj.origin && 
                    targetUrlObj.pathname === '/' && 
                    currentUrlObj.pathname !== '/') {
                  
                  // Store current path segment
                  storePathSegment(CURRENT_URL);
                  
                  // If we have a stored segment, navigate to that instead
                  if (storedSegment) {
                    const smartBackUrl = targetUrlObj.origin + '/' + storedSegment;
                    navigateToUrl(smartBackUrl);
                    return;
                  }
                }
              } catch(e) {}

              navigateToUrl(targetUrl);
            }
          }, true);

          // Intercept form submissions
          document.addEventListener('submit', function(e) {
            const form = e.target;
            e.preventDefault();
            e.stopPropagation();
            
            const action = form.getAttribute('action') || CURRENT_URL;
            navigateToUrl(action);
          }, true);

          // Intercept window.location changes
          const originalLocationHref = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');
          
          Object.defineProperty(window.location, 'href', {
            get: () => originalLocationHref.get.call(window.location),
            set: (url) => {
              try {
                const targetUrlObj = new URL(url, CURRENT_URL);
                const currentUrlObj = new URL(CURRENT_URL);
                
                if (targetUrlObj.origin === currentUrlObj.origin && 
                    targetUrlObj.pathname === '/' && 
                    currentUrlObj.pathname !== '/') {
                  
                  storePathSegment(CURRENT_URL);
                  
                  if (storedSegment) {
                    const smartBackUrl = targetUrlObj.origin + '/' + storedSegment;
                    navigateToUrl(smartBackUrl);
                    return;
                  }
                }
                
                navigateToUrl(url);
              } catch(e) {
                originalLocationHref.set.call(window.location, url);
              }
            }
          });
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
    console.error("Proxy Error:", err.message);
    res.status(500).send("Proxy Error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Proxy running on ${process.env.BASE_URL}`);
});
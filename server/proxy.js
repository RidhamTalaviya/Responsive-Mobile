import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { load } from 'cheerio'; 

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
    } else if (deviceType === 'tablet') {
        userAgent = "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
    }

    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": userAgent,
        "Cookie": req.headers.cookie || "",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      },
      redirect: 'follow'
    });

    const rawSetCookie = upstream.headers.raw()['set-cookie'];
    if (rawSetCookie) {
        const processedCookies = rawSetCookie.map(c => 
            c.replace(/Domain=[^;]+;?/i, '').replace(/Secure;?/i, '')
        );
        res.setHeader('Set-Cookie', processedCookies);
    }

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      let html = await upstream.text();
      const urlObj = new URL(targetUrl);
      const origin = urlObj.origin;

      // Load HTML with cheerio for manipulation
      const $ = load(html);

      // Rewrite ALL links to go through proxy
      $('a').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
          let absoluteUrl = href;
          
          // Convert relative URLs to absolute
          if (!href.startsWith('http')) {
            try {
              absoluteUrl = new URL(href, targetUrl).href;
            } catch (e) {
              return; // Skip invalid URLs
            }
          }
          
          // Rewrite link to go through proxy
          $(elem).attr('href', `http://localhost:5000/proxy?url=${encodeURIComponent(absoluteUrl)}`);
        }
      });

      html = $.html();

      const baseTag = `<base href="${origin}/">`;
      const viewportTag = `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`;
      const styleTag = `<style>
         ::-webkit-scrollbar { display: none; } 
         body { -ms-overflow-style: none; scrollbar-width: none; }
      </style>`;

      // Inject script to update parent window URL when links are clicked
      const urlUpdateScript = `<script>
        (function() {
          // Update parent URL on page load
          const currentProxiedUrl = '${targetUrl}';
          try {
            const parentUrl = new URL(window.parent.location.href);
            const currentUrlParam = parentUrl.searchParams.get('url');
            
            if (currentUrlParam !== currentProxiedUrl) {
              window.parent.history.pushState(
                { url: currentProxiedUrl }, 
                '', 
                '/device?url=' + encodeURIComponent(currentProxiedUrl)
              );
            }
          } catch (e) {
            console.log('Cannot access parent window');
          }

          // Intercept all link clicks
          document.addEventListener('click', function(e) {
            let target = e.target;
            
            // Find the closest anchor tag
            while (target && target.tagName !== 'A') {
              target = target.parentElement;
            }
            
            if (target && target.tagName === 'A') {
              const href = target.getAttribute('href');
              if (href && href.includes('/proxy?url=')) {
                // Extract the actual URL from proxy URL
                const proxyUrl = new URL(href, window.location.href);
                const actualUrl = proxyUrl.searchParams.get('url');
                
                if (actualUrl) {
                  try {
                    // Update parent window URL
                    window.parent.history.pushState(
                      { url: actualUrl }, 
                      '', 
                      '/device?url=' + encodeURIComponent(actualUrl)
                    );
                  } catch (e) {
                    console.log('Cannot update parent URL');
                  }
                }
              }
            }
          }, true);
        })();
      </script>`;

      if (html.includes("<head")) {
        html = html.replace("<head>", `<head>${baseTag}${viewportTag}${styleTag}${urlUpdateScript}`);
      } else {
        html = `${baseTag}${viewportTag}${styleTag}${urlUpdateScript}` + html;
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    res.setHeader("Content-Type", contentType);
    const buffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(buffer));

  } catch (err) {
    console.error("Proxy Error:", err.message);
    return res.status(500).send(`Proxy Error: ${err.message}`);
  }
});

app.listen(5000, () => {
  console.log("Proxy running on http://localhost:5000");
});
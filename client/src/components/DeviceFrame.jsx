import { useState, useEffect, useRef, useCallback } from "react";

function DeviceFrame() {
  const device = { name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'mobile' };
  const [scale, setScale] = useState(1);
  const [fitToScreen, setFitToScreen] = useState(true);
  
  const [history, setHistory] = useState(() => {
    const urlParam = new URL(window.location.href).searchParams.get("url");
    return urlParam ? [urlParam] : [];
  });
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(() => {
    return new URL(window.location.href).searchParams.get("url");
  });

  const [iframeKey, setIframeKey] = useState(0); 
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // Store path segments for intelligent back navigation
  const pathSegmentsRef = useRef(new Map());

  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [device.type]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.historyIndex !== undefined) {
        setHistoryIndex(e.state.historyIndex);
        setCurrentUrl(e.state.url);
      } else {
        const newUrl = new URL(window.location.href).searchParams.get("url");
        if (newUrl) {
          const existingIndex = history.indexOf(newUrl);
          if (existingIndex !== -1) {
            setHistoryIndex(existingIndex);
            setCurrentUrl(newUrl);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [history]);

  // Handle navigation from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'URL_CHANGE') {
        const newUrl = event.data.url;
        const previousUrl = event.data.previousUrl;
        
        if (newUrl !== currentUrl && !isNavigatingRef.current) {
          isNavigatingRef.current = true;
          
          // Store path segment relationship
          if (previousUrl) {
            try {
              const prevUrlObj = new URL(previousUrl);
              const newUrlObj = new URL(newUrl);
              
              if (prevUrlObj.origin === newUrlObj.origin) {
                const prevPath = prevUrlObj.pathname;
                const newPath = newUrlObj.pathname;
                
                // Extract first segment from previous URL
                const prevSegments = prevPath.split('/').filter(s => s);
                if (prevSegments.length > 0) {
                  const firstSegment = prevSegments[0];
                  pathSegmentsRef.current.set(prevUrlObj.origin, firstSegment);
                }
              }
            } catch (e) {
              console.error('Error storing path segment:', e);
            }
          }
          
          setHistory(prev => {
            const newHistory = [...prev.slice(0, historyIndex + 1), newUrl];
            return newHistory;
          });
          
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setCurrentUrl(newUrl);
          
          const newPath = `${window.location.pathname}?url=${newUrl}`;
          window.history.pushState(
            { url: newUrl, historyIndex: newIndex }, 
            "", 
            newPath
          );
          
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 100);
        }
      } else if (event.data && event.data.type === 'BACK_TO_BASE') {
        // Handle smart back navigation
        const baseUrl = event.data.baseUrl;
        const storedSegment = pathSegmentsRef.current.get(baseUrl);
        
        if (storedSegment) {
          const smartBackUrl = `${baseUrl}/${storedSegment}`;
          
          if (smartBackUrl !== currentUrl && !isNavigatingRef.current) {
            isNavigatingRef.current = true;
            
            setHistory(prev => {
              const newHistory = [...prev.slice(0, historyIndex + 1), smartBackUrl];
              return newHistory;
            });
            
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setCurrentUrl(smartBackUrl);
            
            const newPath = `${window.location.pathname}?url=${smartBackUrl}`;
            window.history.pushState(
              { url: smartBackUrl, historyIndex: newIndex }, 
              "", 
              newPath
            );
            
            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 100);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentUrl, historyIndex]);

  const BEZEL = {
    mobile: { top: 8, right: 8, bottom: 8, left: 8 },
    tablet: { top: 12, right: 12, bottom: 12, left: 12 },
    desktop: { top: 2, right: 2, bottom: 2, left: 2 },
  };

  const getFrameDimensions = useCallback(() => {
    const bezel = BEZEL[device.type] || BEZEL.desktop;
    return {
      screenWidth: device.width,
      screenHeight: device.height,
      frameWidth: device.width + bezel.left + bezel.right,
      frameHeight: device.height + bezel.top + bezel.bottom,
      bezel,
    };
  }, [device]);

  const dimensions = getFrameDimensions();

  const calculateScale = useCallback(() => {
    if (!fitToScreen) {
      setScale(1);
      return;
    }
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width - 40; 
    const availableHeight = containerRect.height - 40; 

    if (availableWidth <= 0 || availableHeight <= 0) return;

    const widthScale = availableWidth / dimensions.frameWidth;
    const heightScale = availableHeight / dimensions.frameHeight;
    setScale(Math.min(widthScale, heightScale)); 
  }, [dimensions, fitToScreen]);

  useEffect(() => {
    calculateScale();
    const resizeObserver = new ResizeObserver(() => calculateScale());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", calculateScale);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", calculateScale);
    };
  }, [calculateScale]);

  const frameStyle = {
    width: `${dimensions.frameWidth}px`,
    height: `${dimensions.frameHeight}px`,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    transition: 'transform 0.2s ease-out',
  };

  const screenStyle = {
    width: `${dimensions.screenWidth}px`,
    height: `${dimensions.screenHeight}px`,
  };

  const proxySrc = currentUrl 
    ? `${import.meta.env.VITE_PROXY_URL}/proxy?url=${currentUrl}` 
    : '';

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] font-sans text-[#e0e0e0] overflow-hidden">
      <div className="flex-1 flex overflow-hidden justify-center">
        <div 
          ref={containerRef} 
          className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#1e1e1e] p-10 box-border"
        >
          <div 
            ref={wrapperRef} 
            style={frameStyle}
            className="relative shrink-0 flex justify-center"
          >
            <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-20 shadow-sm pointer-events-none"></div>
              
              <div 
                style={screenStyle} 
                className="absolute top-2 left-2 bg-white rounded-[32px] overflow-hidden z-10"
              >
                {currentUrl && (
                  <iframe
                    key={iframeKey + currentUrl} 
                    src={proxySrc}
                    className="w-full h-full border-none block bg-white"
                    title="Mobile Preview"
                  />
                )}
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full z-20 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceFrame;
import { useState, useEffect, useRef, useCallback } from "react";

function DeviceFrame() {
  const device = { name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'mobile' };
  const [scale, setScale] = useState(1);
  const [fitToScreen, setFitToScreen] = useState(true);
  
  // 1. STATE: Store the current target URL in state so we can update it
  // Initialize with the current browser URL query param
  const [currentUrl, setCurrentUrl] = useState(() => {
    return new URL(window.location.href).searchParams.get("url");
  });

  const [iframeKey, setIframeKey] = useState(0); 

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [device.type]);

  // 2. LISTENER: Handle "Back/Forward" Buttons (popstate)
  // This detects when the user clicks the browser Back button
  useEffect(() => {
    const handlePopState = () => {
      const newUrl = new URL(window.location.href).searchParams.get("url");
      if (newUrl && newUrl !== currentUrl) {
        setCurrentUrl(newUrl); // Update state -> Triggers re-render -> Iframe updates
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUrl]);

  // 3. LISTENER: Handle Internal Clicks (from inside iframe)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'URL_CHANGE') {
        const newUrl = event.data.url;
        
        // Only update the address bar visual, don't force reload the iframe 
        // (because the iframe is ALREADY at that page)
        if (newUrl !== currentUrl) {
            const newPath = `${window.location.pathname}?url=${newUrl}`;
            window.history.pushState({}, "", newPath);
            // We update the state silently so if they refresh, it's correct
            // But strictly speaking, we don't want to re-render iframe here causing a double-load
            // We just update the reference.
            setCurrentUrl(newUrl);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentUrl]);


  // Standard Scaling Logic...
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

  // 4. DYNAMIC SRC: Use the state variable 'currentUrl'
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
            <div className="relative w-full h-full bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-20 shadow-sm pointer-events-none"></div>
              
              <div 
                style={screenStyle} 
                className="absolute top-2 left-2 bg-white rounded-4xl overflow-hidden z-10"
              >
                {/* 5. KEY PROP: Adding currentUrl to key forces React to treat it as a new page if needed */}
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
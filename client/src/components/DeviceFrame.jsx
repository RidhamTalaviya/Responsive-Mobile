import { useState, useEffect, useRef, useCallback } from "react";

function DeviceFrame() {
  const device = { name: 'iPhone 14 Pro Max', width: 430, height: 932, type: 'mobile' };
  const [scale, setScale] = useState(1);
  const [fitToScreen, setFitToScreen] = useState(true);
  const [iframeKey, setIframeKey] = useState(0); 
  const url = new URL(window.location.href).searchParams.get("data");
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [ device.type]);

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

  const proxySrc = `http://localhost:5000/proxy?url=https://vcards.infyom.com/${url}`;

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] font-sans text-[#e0e0e0] overflow-hidden">
      
      <div className="flex-1 flex overflow-hidden justify-center">
        
        <div className="flex-1 flex items-center justify-center bg-[#1a1a1a] p-5 overflow-auto"></div>
    <div 
      ref={containerRef} 
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#1e1e1e] p-10 box-border"
    >
      
      {/* FRAME WRAPPER: Handles the scaling transform */}
      <div 
        ref={wrapperRef} 
        style={frameStyle}
        className="relative shrink-0 flex justify-center"
      >
        
        
          <div className="relative w-full h-full bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-20 shadow-sm pointer-events-none"></div>
            
            {/* Screen */}
            <div 
              style={screenStyle} 
              className="absolute top-2 left-2 bg-red-500 rounded-4xl overflow-hidden z-10"
            >
              <iframe
                 key={iframeKey}
                 src={proxySrc}
                 className="w-full h-full border-none block bg-white"
                 title="Mobile Preview"
                 allow="cross-origin-isolated" 
              />
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full z-20 pointer-events-none"></div>
          </div>
      </div>
      </div>
      </div>

    </div>
  );
}

export default DeviceFrame;
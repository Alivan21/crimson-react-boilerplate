import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(number = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${number - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < number);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < number);
    return () => mql.removeEventListener("change", onChange);
  }, [number]);

  return !!isMobile;
}

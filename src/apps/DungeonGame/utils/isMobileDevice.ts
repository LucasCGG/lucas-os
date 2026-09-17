export function isMobileDevice(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    const userAgent = navigator.userAgent || "";
    const userAgentMobile = /android|webos|iphone|blackberry|iemobile|opera mini|mobile/i.test(
        userAgent
    );
    const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

    return userAgentMobile || iPadOS;
}

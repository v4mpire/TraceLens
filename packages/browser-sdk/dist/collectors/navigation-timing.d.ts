import { NavigationTiming } from '@tracelens/shared';
export declare class NavigationTimingCollector {
    collect(): NavigationTiming | null;
    collectOnLoad(callback: (timing: NavigationTiming) => void): void;
    isSupported(): boolean;
}
//# sourceMappingURL=navigation-timing.d.ts.map
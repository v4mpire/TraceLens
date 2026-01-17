export interface SanitizationConfig {
    enablePIIFiltering: boolean;
    enableDataSanitization: boolean;
    customPatterns: Array<{
        name: string;
        pattern: RegExp;
        replacement: string;
    }>;
    allowedDomains: string[];
    maxStringLength: number;
    maxObjectDepth: number;
}
export declare class DataSanitizer {
    private config;
    private readonly piiPatterns;
    private readonly sensitiveFields;
    constructor(config?: Partial<SanitizationConfig>);
    sanitizeEvent(event: Record<string, unknown>): Record<string, unknown>;
    sanitizeTrace(trace: Record<string, unknown>): Record<string, unknown>;
    private sanitizeSpan;
    private sanitizeObject;
    private sanitizeString;
    private sanitizeUrl;
    private isSensitiveField;
    updateConfig(config: Partial<SanitizationConfig>): void;
    addCustomPattern(name: string, pattern: RegExp, replacement: string): void;
    removeCustomPattern(name: string): void;
}
//# sourceMappingURL=data-sanitizer.d.ts.map
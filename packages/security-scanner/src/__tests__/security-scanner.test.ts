// Security scanner tests
import { SecurityScanner } from '../index';

// Mock fetch to avoid real API calls in tests
global.fetch = jest.fn();

describe('SecurityScanner', () => {
  let scanner: SecurityScanner;

  beforeEach(() => {
    scanner = new SecurityScanner();
    jest.clearAllMocks();
  });

  it('should create scanner instance', () => {
    expect(scanner).toBeDefined();
  });

  it('should provide cache statistics', () => {
    const stats = scanner.getCacheStats();
    
    expect(stats).toHaveProperty('cveCount');
    expect(stats).toHaveProperty('oldestCVE');
    expect(stats).toHaveProperty('newestCVE');
    expect(typeof stats.cveCount).toBe('number');
  });

  it('should handle periodic updates', () => {
    expect(scanner.getUpdateStatus().isRunning).toBe(false);

    scanner.startPeriodicUpdates();
    expect(scanner.getUpdateStatus().isRunning).toBe(true);

    scanner.stopPeriodicUpdates();
    expect(scanner.getUpdateStatus().isRunning).toBe(false);
  });

  it('should scan empty dependencies', async () => {
    // Mock empty CVE response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ vulnerabilities: [] })
    });

    const dependencies: any[] = [];
    const result = await scanner.scanDependencies(dependencies);

    expect(result.dependenciesScanned).toBe(0);
    expect(result.runtimeRisks.length).toBe(0);
    expect(result.processingTime).toBeGreaterThan(0);
  });
});

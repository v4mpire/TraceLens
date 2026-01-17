// Basic validation test
import { validateProjectId, validateTimestamp, validateVersion } from '../utils/validation';

describe('Basic Validation', () => {
  test('validateProjectId works', () => {
    expect(validateProjectId('my-project')).toBe(true);
    expect(validateProjectId('ab')).toBe(false);
  });

  test('validateTimestamp works', () => {
    expect(validateTimestamp(Date.now())).toBe(true);
    expect(validateTimestamp(0)).toBe(false);
  });

  test('validateVersion works', () => {
    expect(validateVersion('1.0.0')).toBe(true);
    expect(validateVersion('invalid')).toBe(false);
  });
});

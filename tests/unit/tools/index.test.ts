import { describe, it, expect } from 'vitest';
import { handleToolCall, tools } from '../../../src/tools/index.js';
import { createMockGoogleAPIs } from '../../utils/test-helpers.js';

describe('tools/index', () => {
  describe('tools list', () => {
    it('should export all tool definitions', () => {
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should have valid tool definitions', () => {
      tools.forEach((tool) => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    it('should include Drive tools', () => {
      const driveTools = tools.filter((t) => t.name.startsWith('drive_'));
      expect(driveTools.length).toBeGreaterThan(0);

      const toolNames = driveTools.map((t) => t.name);
      expect(toolNames).toContain('drive_list_files');
      expect(toolNames).toContain('drive_create_file');
      expect(toolNames).toContain('drive_read_file');
    });

    it('should include Docs tools', () => {
      const docsTools = tools.filter((t) => t.name.startsWith('docs_'));
      expect(docsTools.length).toBeGreaterThan(0);

      const toolNames = docsTools.map((t) => t.name);
      expect(toolNames).toContain('docs_read_document');
      expect(toolNames).toContain('docs_create_document');
      expect(toolNames).toContain('docs_append_content');
    });

    it('should include Calendar tools', () => {
      const calendarTools = tools.filter((t) => t.name.startsWith('calendar_'));
      expect(calendarTools.length).toBeGreaterThan(0);

      const toolNames = calendarTools.map((t) => t.name);
      expect(toolNames).toContain('calendar_list_events');
      expect(toolNames).toContain('calendar_create_event');
      expect(toolNames).toContain('calendar_get_event');
    });
  });

  describe('handleToolCall', () => {
    it('should return error for unknown tool', async () => {
      const apis = createMockGoogleAPIs();
      const result = await handleToolCall('unknown_tool', {}, apis);

      expect(result.error).toBe(true);
      expect(result.errorType).toBe('ValidationError');
      expect(result.message).toContain('Unknown tool');
    });

    it('should route to correct handler for known tools', async () => {
      const apis = createMockGoogleAPIs();

      // This will fail because we're not mocking the actual implementation,
      // but it tests that the routing works
      const result = await handleToolCall('drive_list_files', {}, apis);

      // The result might be success or error depending on mock setup,
      // but it shouldn't be "Unknown tool"
      if (result.error) {
        expect(result.errorType).not.toBe('ValidationError');
        expect(result.message).not.toContain('Unknown tool');
      }
    });
  });
});

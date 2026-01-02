import { Module } from '@/types/module';
import { cbtReframeRelayModule } from './cbt-reframe-relay';
import { thoughtReframeRelayModule } from './thought-reframe-relay';

/**
 * Registry of all available modules
 */
export const modules: Record<string, Module> = {
  cbt_reframe_relay: cbtReframeRelayModule,
  thought_reframe_relay: thoughtReframeRelayModule,
};

/**
 * Get a module by ID
 */
export function getModule(moduleId: string): Module | undefined {
  return modules[moduleId];
}

/**
 * Get all modules
 */
export function getAllModules(): Module[] {
  return Object.values(modules);
}


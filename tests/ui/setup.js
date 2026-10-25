import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
Element.prototype.scrollIntoView = () => {};

beforeEach(() => sessionStorage.setItem('ateelabo_intro_seen', 'true'));

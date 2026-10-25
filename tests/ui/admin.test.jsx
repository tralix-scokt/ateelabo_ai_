import React from 'react';
import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../../src/pages/AdminDashboard';
test('admin role selector calls its handler and refreshes statistics', async () => {
  localStorage.setItem('ateelabo_user',JSON.stringify({id:'owner',name:'Owner',role:'admin'}));
  const mock=vi.fn().mockResolvedValue({ok:true,json:async()=>({userActivity:[{id:'other',name:'Test User',email:'test@example.com',role:'user'}]})});
  vi.stubGlobal('fetch',mock);
  render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
  const select=await screen.findByLabelText('Change role for Test User');
  fireEvent.change(select,{target:{value:'admin'}});
  await waitFor(()=>expect(mock.mock.calls.some(([url,options])=>url==='/api/admin/users/other/role' && options.method==='PATCH')).toBe(true));
  await waitFor(()=>expect(mock.mock.calls.filter(([url])=>url==='/api/admin/stats').length).toBeGreaterThan(1));
});

import React from 'react';
import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
vi.mock('react-speech-recognition', () => ({ default:{startListening:vi.fn(),stopListening:vi.fn()}, useSpeechRecognition:()=>({transcript:'',browserSupportsSpeechRecognition:false}) }));
const openApp = () => render(<MemoryRouter><App /></MemoryRouter>);

test('text chat works without speech support and corrupt saved user does not crash', async () => {
  localStorage.setItem('ateelabo_user','{');
  openApp();
  expect(screen.getByLabelText('Start voice input').disabled).toBe(true);
  const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({reply:'A tested reply'})});
  vi.stubGlobal('fetch',fetchMock);
  fireEvent.change(screen.getByLabelText('Message Ateelabo AI'),{target:{value:'Hello'}});
  fireEvent.click(screen.getByLabelText('Send message'));
  await screen.findByText('A tested reply');
  expect(fetchMock.mock.calls[0][0]).toBe('/api/chat');
});

test('saved history and document context are account scoped; prior turns sent', async () => {
  localStorage.setItem('ateelabo_user',JSON.stringify({id:'alice',name:'Alice'}));
  localStorage.setItem('ateelabo_chats',JSON.stringify([{id:'old',title:'Legacy private',messages:[]}]));
  localStorage.setItem('ateelabo_chats:bob',JSON.stringify([{id:'bob',title:'Bob private',messages:[]}]));
  localStorage.setItem('ateelabo_chats:alice',JSON.stringify([{id:'alice-chat',title:'Alice history',fileContext:'Alice document',messages:[{role:'user',text:'Previous question'},{role:'ai',text:'Previous answer'}]}]));
  const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({reply:'Followup reply'})});
  vi.stubGlobal('fetch',fetchMock);
  openApp();
  await screen.findByText('Previous answer');
  expect(screen.queryByText('Bob private')).toBeNull();
  expect(screen.queryByText('Legacy private')).toBeNull();
  fireEvent.change(screen.getByLabelText('Message Ateelabo AI'),{target:{value:'Follow up'}});
  fireEvent.click(screen.getByLabelText('Send message'));
  await screen.findByText('Followup reply');
  const form=fetchMock.mock.calls[0][1].body;
  expect(form.get('fileContext')).toBe('Alice document');
  expect(JSON.parse(form.get('history'))[1]).toEqual({role:'assistant',content:'Previous answer'});
  expect(localStorage.getItem('ateelabo_chats')).toContain('Legacy private');
});

test('network failure is visible and Enter-to-send preference is honored', async () => {
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('Network unavailable')));
  localStorage.setItem('ateelabo_enter_to_send','false');
  openApp();
  const input=screen.getByLabelText('Message Ateelabo AI');
  fireEvent.change(input,{target:{value:'Hello'}});
  fireEvent.keyDown(input,{key:'Enter'});
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText('Send message'));
  await screen.findByText('Network unavailable');
  await waitFor(()=>expect(screen.queryByText('Network unavailable')).not.toBeNull());
});

test('new chats do not inherit another chat document', async () => {
  localStorage.setItem('ateelabo_chats:guest',JSON.stringify([{id:'one',title:'Document chat',fileContext:'Private document',messages:[]}]));
  const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>({reply:'Fresh reply'})});
  vi.stubGlobal('fetch',fetchMock);
  openApp();
  await screen.findByText('Document chat');
  fireEvent.click(screen.getByRole('button',{name:/new chat/i}));
  fireEvent.change(screen.getByLabelText('Message Ateelabo AI'),{target:{value:'Fresh question'}});
  fireEvent.click(screen.getByLabelText('Send message'));
  await screen.findByText('Fresh reply');
  expect(fetchMock.mock.calls[0][1].body.get('fileContext')).toBeNull();
});

test('logout switches to guest history without overwriting the signed-in account', async () => {
  localStorage.setItem('ateelabo_user',JSON.stringify({id:'alice',name:'Alice'}));
  localStorage.setItem('ateelabo_chats:alice',JSON.stringify([{id:'one',title:'Alice secret',messages:[]}]));
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({})}));
  openApp();
  await screen.findByText('Alice secret');
  fireEvent.click(screen.getByRole('button',{name:/log\s*out/i}));
  await waitFor(()=>expect(screen.queryByText('Alice secret')).toBeNull());
  expect(localStorage.getItem('ateelabo_chats:alice')).toContain('Alice secret');
  expect(localStorage.getItem('ateelabo_user')).toBeNull();
});

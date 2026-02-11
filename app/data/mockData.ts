import type { NetworkStats, Anchor, Event, Account, EventStatus } from '../types';

export const MOCK_STATS: NetworkStats = {
  total_anchors: 12345,
  total_events: 567890,
  total_validators: 12,
  total_solvers: 34,
  tps: 1245.8,
  avg_anchor_time: 5.2
};

export const generateMockAnchors = (count: number): Anchor[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `anchor_setu_${Math.random().toString(16).slice(2, 10)}`,
    depth: 12345 - i,
    event_count: Math.floor(Math.random() * 200) + 50,
    timestamp: Date.now() - i * 5000,
    vlc_time: 123450 - i,
    proposer: `validator-${(i % 5) + 1}`,
    status: 'finalized',
    state_root: `0x${Math.random().toString(16).slice(2, 34)}`
  }));
};

export const generateMockEvents = (count: number): Event[] => {
  const types = ['Transfer', 'System', 'ValidatorRegister', 'SubnetRegister', 'PowerConsume', 'TaskSubmit'];
  const statuses: EventStatus[] = ['Finalized', 'Confirmed', 'Executed'];

  return Array.from({ length: count }).map((_, i) => ({
    id: `ev_${Math.random().toString(16).slice(2, 12)}`,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    creator: i % 2 === 0 ? `solver-${(i % 10) + 1}` : `0x${Math.random().toString(16).slice(2, 10)}`,
    timestamp: Date.now() - i * 1000,
    vlc_time: 123449 - i,
    anchor_id: `anchor_setu_99a8b${i}`,
    anchor_depth: 12345 - Math.floor(i / 10),
    parent_ids: [`ev_p${i}1`, `ev_p${i}2`],
    children_ids: [`ev_c${i}1`],
    summary: `Processed ${types[i % types.length]} event for user_${Math.random().toString(16).slice(2, 6)}`
  }));
};

export const getMockAccount = (address: string): Account => ({
  address,
  balance: 1000,
  profile: {
    display_name: address.charAt(0).toUpperCase() + address.slice(1),
    bio: "Setu ecosystem participant and DeFi enthusiast."
  },
  statistics: {
    total_sent: 5200.5,
    total_received: 6200.5,
    transaction_count: 142,
    first_seen: Date.now() - 30 * 24 * 60 * 60 * 1000,
    last_active: Date.now() - 5 * 60 * 1000
  },
  credentials: [
    { type: 'kyc', level: 'level_2', issuer: 'Setu Compliance', status: 'Active' }
  ]
});

import type {
  ExplorerStatsResponse,
  AnchorsResponse,
  AnchorDetailResponse,
  EventsResponse,
  EventDetailResponse,
  AccountResponse,
  ValidatorsResponse,
  SolversResponse,
  SearchResponse,
  DagLiveResponse,
  DagPathResponse,
} from './types';
import { MOCK_STATS, generateMockAnchors, generateMockEvents, getMockAccount } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchExplorerStats(): Promise<ExplorerStatsResponse> {
  await delay(500);
  return {
    network: {
      total_anchors: MOCK_STATS.total_anchors,
      total_events: MOCK_STATS.total_events,
      total_validators: MOCK_STATS.total_validators,
      total_solvers: MOCK_STATS.total_solvers,
      tps: MOCK_STATS.tps,
      avg_anchor_time: MOCK_STATS.avg_anchor_time,
    }
  };
}

export async function fetchAnchors(params?: { page?: number; limit?: number }): Promise<AnchorsResponse> {
  await delay(500);
  const limit = params?.limit || 10;
  return {
    anchors: generateMockAnchors(limit).map(a => ({
      ...a,
      status: a.status as string,
    })),
    pagination: { page: params?.page || 1, limit, total: 1000, total_pages: 100 }
  };
}

export async function fetchAnchor(anchorId: string): Promise<AnchorDetailResponse> {
  await delay(500);
  const a = generateMockAnchors(1)[0];
  return {
    id: anchorId,
    depth: a.depth,
    timestamp: a.timestamp,
    vlc_snapshot: { logical_time: a.vlc_time, physical_time: a.timestamp },
    event_ids: [`ev_${Math.random().toString(16).slice(2, 8)}`, `ev_${Math.random().toString(16).slice(2, 8)}`],
    event_count: a.event_count,
    merkle_roots: {
      global_state_root: a.state_root,
      events_root: "0x112233...",
      anchor_chain_root: "0x445566...",
      subnet_roots: { ROOT: "0x778899..." }
    }
  };
}

export async function fetchEvents(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  creator?: string;
}): Promise<EventsResponse> {
  await delay(500);
  const limit = params?.limit || 10;
  return {
    events: generateMockEvents(limit).map(e => ({
      ...e,
      status: e.status as string,
    })),
    pagination: { page: params?.page || 1, limit, total: 1000, total_pages: 100 }
  };
}

export async function fetchEvent(eventId: string): Promise<EventDetailResponse> {
  await delay(500);
  const e = generateMockEvents(1)[0];
  return {
    id: eventId,
    type: e.type,
    status: e.status as string,
    creator: e.creator,
    timestamp: e.timestamp,
    vlc_snapshot: { logical_time: e.vlc_time, physical_time: e.timestamp },
    parent_ids: e.parent_ids,
    children_ids: e.children_ids,
    anchor_id: e.anchor_id,
    anchor_depth: e.anchor_depth,
    payload: {
      Transfer: {
        from: `0x${Math.random().toString(16).slice(2, 10)}`,
        to: `0x${Math.random().toString(16).slice(2, 10)}`,
        amount: "100.50 FLUX"
      }
    },
    execution_result: {
      success: true,
      message: "TEE isolation verified. Execution took 1.2ms.",
      state_changes: [
        { key: "acc:alice", old_value: "1000", new_value: "899.5" }
      ]
    }
  };
}

export async function fetchAccount(address: string): Promise<AccountResponse> {
  await delay(500);
  return getMockAccount(address);
}

export async function fetchValidators(): Promise<ValidatorsResponse> {
  await delay(500);
  return {
    validators: Array.from({ length: 12 }).map((_, i) => ({
      validator_id: `vld-${i + 1}`,
      address: `0xval_${i}`,
      status: 'online',
      stake_amount: 10000 + i * 500,
      statistics: {
        proposed_cfs: 1000,
        approved_votes: 990,
        rejected_votes: 10,
        uptime_percentage: 99.8 - i * 0.1
      }
    }))
  };
}

export async function fetchSolvers(): Promise<SolversResponse> {
  await delay(500);
  return {
    solvers: Array.from({ length: 34 }).map((_, i) => ({
      solver_id: `slv-${i + 1}`,
      address: `0xsolv_${i}`,
      status: 'active',
      current_load: 30 + (i % 5) * 4,
      statistics: {
        total_events_processed: 100000,
        success_rate: 99.5,
        avg_execution_time_us: 1200
      }
    }))
  };
}

export async function fetchSearch(q: string): Promise<SearchResponse> {
  await delay(500);
  const typeMap: Record<string, any> = {
    'anchor': 'anchor',
    'ev': 'event',
    '0x': 'account',
    'vld': 'validator',
    'slv': 'solver'
  };
  const prefix = Object.keys(typeMap).find(p => q.startsWith(p)) || 'account';
  const type = typeMap[prefix];

  return {
    results: [{
      type: type,
      id: q,
      url: `/${type}/${q}`,
      address: type === 'account' ? q : undefined,
      depth: type === 'anchor' ? 12345 : undefined,
      event_count: type === 'anchor' ? 45 : undefined,
      status: 'active'
    }]
  };
}

export async function fetchDagLive(params?: {
  anchor_id?: string;
  limit?: number;
  since_event_id?: string;
}): Promise<DagLiveResponse> {
  await delay(500);
  return {
    nodes: [],
    edges: [],
    metadata: { total_nodes: 0, total_edges: 0, depth_range: [0, 0] }
  };
}

export async function fetchDagPath(eventId: string): Promise<DagPathResponse> {
  await delay(500);
  return {
    event_id: eventId,
    ancestors: [],
    descendants: [],
    path_edges: []
  };
}

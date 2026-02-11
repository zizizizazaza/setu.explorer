
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}


export interface ExplorerStatsResponse {
  network: {
    total_anchors: number;
    total_events: number;
    total_validators: number;
    total_solvers: number;
    tps: number;
    avg_anchor_time: number;
  };
  latest_anchor?: {
    id: string;
    depth: number;
    event_count: number;
    timestamp: number;
    vlc_time: number;
  };
  recent_activity?: {
    last_24h_events: number;
    last_24h_transfers: number;
    last_24h_registrations: number;
  };
}


export interface AnchorListItem {
  id: string;
  depth: number;
  event_count: number;
  timestamp: number;
  vlc_time: number;
  proposer: string;
  status: string;
  state_root: string;
}


export interface AnchorsResponse {
  anchors: AnchorListItem[];
  pagination: Pagination;
}


export interface AnchorDetailResponse {
  id: string;
  depth: number;
  timestamp: number;
  vlc_snapshot?: { logical_time: number; physical_time: number };
  previous_anchor?: string;
  next_anchor?: string;
  event_ids?: string[];
  event_count: number;
  merkle_roots?: {
    global_state_root: string;
    events_root: string;
    anchor_chain_root: string;
    subnet_roots: Record<string, string>;
  };
  statistics?: {
    transfer_count: number;
    registration_count: number;
    system_event_count: number;
  };
}


export interface EventListItem {
  id: string;
  type: string;
  status: string;
  creator: string;
  timestamp: number;
  vlc_time: number;
  anchor_id: string;
  anchor_depth: number;
  parent_count?: number;
  summary: string;
}


export interface EventsResponse {
  events: EventListItem[];
  pagination: Pagination;
}


export interface EventDetailResponse {
  id: string;
  type: string;
  status: string;
  creator: string;
  timestamp: number;
  vlc_snapshot?: { logical_time: number; physical_time: number };
  parent_ids: string[];
  children_ids?: string[];
  subnet_id?: string;
  anchor_id: string;
  anchor_depth: number;
  payload?: Record<string, unknown>;
  execution_result?: {
    success: boolean;
    message: string;
    state_changes: Array<{ key: string; old_value: string; new_value: string }>;
  };
  dag_visualization?: { depth: number; parent_depths: number[]; children_count: number };
}


export interface AccountResponse {
  address: string;
  balance: number;
  profile: { display_name: string; avatar_url?: string; bio: string };
  statistics: {
    total_sent: number;
    total_received: number;
    transaction_count: number;
    first_seen: number;
    last_active: number;
  };
  credentials: Array<{ type: string; level: string; issuer: string; status: string }>;
  recent_events?: Array<{ id: string; type: string; timestamp: number; summary: string }>;
}


export interface ValidatorItem {
  validator_id: string;
  address: string;
  network_address?: string;
  status: string;
  stake_amount: number;
  commission_rate?: number;
  statistics?: {
    proposed_cfs: number;
    approved_votes: number;
    rejected_votes: number;
    uptime_percentage: number;
  };
  registered_at?: number;
}

export interface ValidatorsResponse {
  validators: ValidatorItem[];
}


export interface SolverItem {
  solver_id: string;
  address: string;
  network_address?: string;
  status: string;
  capacity?: number;
  current_load?: number;
  shard_id?: string;
  resources?: string[];
  statistics?: {
    total_events_processed: number;
    success_rate: number;
    avg_execution_time_us: number;
  };
  registered_at?: number;
}

export interface SolversResponse {
  solvers: SolverItem[];
}


export interface SearchResultItem {
  type: 'anchor' | 'event' | 'account' | 'validator' | 'solver';
  id: string;
  url: string;
  depth?: number;
  event_count?: number;
  event_type?: string;
  status?: string;
  address?: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

export interface DagNode {
  id: string;
  event_id: string;
  type: string;
  status: string;
  depth: number;
  timestamp: number;
  creator: string;
  vlc_time: number;
  label: string;
  size: number;
  color: string;
}

export interface DagEdge {
  from: string;
  to: string;
  type: string;
}

export interface DagLiveResponse {
  nodes: DagNode[];
  edges: DagEdge[];
  metadata: {
    total_nodes: number;
    total_edges: number;
    depth_range: [number, number];
    latest_event_id?: string;
    anchor_id?: string;
  };
}


export interface DagPathResponse {
  event_id: string;
  ancestors: Array<{
    id: string;
    event_id: string;
    type: string;
    status: string;
    depth: number;
    timestamp: number;
    creator: string;
    vlc_time: number;
    label: string;
    size: number;
    color: string;
  }>;
  descendants: Array<{ id: string; type: string; depth: number }>;
  path_edges: DagEdge[];
}


export interface ApiErrorResponse {
  error: string;
  message?: string;
}

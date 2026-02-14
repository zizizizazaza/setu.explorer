export type EventStatus = 'Pending' | 'InWorkQueue' | 'Executed' | 'Confirmed' | 'Finalized' | 'Failed';
export type CFStatus = 'Proposed' | 'Voting' | 'Approved' | 'Finalized' | 'Rejected';

export interface NetworkStats {
  total_anchors: number;
  total_events: number;
  total_validators: number;
  total_solvers: number;
  tps: number;
  avg_anchor_time: number;
}

export interface Anchor {
  id: string;
  depth: number;
  event_count: number;
  timestamp: number;
  vlc_time: number;
  proposer: string;
  status: string;
  state_root: string;
  previous_anchor?: string;
  next_anchor?: string;
  merkle_roots?: {
    global_state_root: string;
    events_root: string;
    anchor_chain_root: string;
    subnet_roots: Record<string, string>;
  };
}

export interface Event {
  id: string;
  type: string;
  status: EventStatus;
  creator: string;
  timestamp: number;
  vlc_time: number;
  anchor_id: string;
  anchor_depth: number;
  parent_ids: string[];
  children_ids?: string[];
  summary: string;
  payload?: any;
  execution_result?: {
    success: boolean;
    message: string;
    state_changes: Array<{ key: string; old_value: string | unknown; new_value: string | unknown }>;
  };
}

export interface Account {
  address: string;
  balance: number;
  profile: {
    display_name: string;
    avatar_url?: string;
    bio: string;
  };
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

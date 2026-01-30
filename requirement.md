1. 项目概述
Setu 是一个基于 DAG（有向无环图）的区块链系统，与传统区块链的"区块"概念不同
1.1 核心概念对比
传统区块链
Setu 系统
说明
Block（区块）
Anchor（锚点）
检查点，包含一批已确认的事件
Transaction（交易）
Event（事件）
状态变更的基本单位
Block Height
Anchor Depth
锚点深度（链上位置）
Transaction Hash
Event ID
事件唯一标识符
Merkle Root
Merkle Roots
多个 Merkle 树根（全局状态、事件树、锚点链）
Consensus
ConsensusFrame (CF)
共识，包含投票和最终确认
2. 核心数据结构
2.1 Anchor（锚点）- 相当于"区块"
pub struct Anchor {
    pub id: AnchorId,                          // 锚点 ID（哈希）
    pub event_ids: Vec<EventId>,               // 包含的事件列表
    pub vlc_snapshot: VLCSnapshot,             // VLC 快照（逻辑时钟）
    pub state_root: String,                    // 状态根（兼容字段）
    pub merkle_roots: Option<AnchorMerkleRoots>, // 完整 Merkle 根
    pub previous_anchor: Option<AnchorId>,     // 前一个锚点
    pub depth: u64,                            // 深度（类似区块高度）
    pub timestamp: u64,                        // 时间戳（毫秒）
}

pub struct AnchorMerkleRoots {
    pub global_state_root: [u8; 32],           // 全局状态根
    pub events_root: [u8; 32],                 // 事件树根
    pub anchor_chain_root: [u8; 32],           // 锚点链根
    pub subnet_roots: HashMap<SubnetId, [u8; 32]>, // 各子网状态根
}
浏览器展示方式：
- Anchor ID 和 Depth（类似区块哈希和高度）
- 包含的事件数量
- 前后锚点链接（可点击跳转）
- Merkle 根（可验证数据完整性）
- 时间戳和 VLC 逻辑时间
2.2 Event（事件）- 相当于"交易"
pub struct Event {
    pub id: EventId,                           // 事件 ID
    pub event_type: EventType,                 // 事件类型
    pub parent_ids: Vec<EventId>,              // 父事件（DAG 结构）
    pub subnet_id: Option<SubnetId>,           // 所属子网
    pub payload: EventPayload,                 // 事件负载
    pub vlc_snapshot: VLCSnapshot,             // VLC 快照
    pub creator: String,                       // 创建者（Solver/Validator）
    pub status: EventStatus,                   // 状态
    pub execution_result: Option<ExecutionResult>, // 执行结果
    pub timestamp: u64,                        // 时间戳
}

pub enum EventType {
    Genesis,                    // 创世事件
    System,                     // 系统事件
    Transfer,                   // 转账
    ValidatorRegister,          // Validator 注册
    ValidatorUnregister,        // Validator 注销
    SolverRegister,             // Solver 注册
    SolverUnregister,           // Solver 注销
    SubnetRegister,             // 子网注册
    UserRegister,               // 用户注册
    PowerConsume,               // 算力消耗
    TaskSubmit,                 // 任务提交
}

pub enum EventStatus {
    Pending,        // 待处理
    InWorkQueue,    // 工作队列中
    Executed,       // 已执行
    Confirmed,      // 已确认
    Finalized,      // 已最终确认（不可逆）
    Failed,         // 失败
}
浏览器展示方式：
- Event ID 和类型
- 父事件（DAG 可视化）
- 创建者和时间戳
- 状态（Pending → Executed → Confirmed → Finalized）
- 执行结果（成功/失败，状态变更）
2.3  ConsensusFrame（共识）
pub struct ConsensusFrame {
    pub id: CFId,                              // CF ID
    pub anchor: Anchor,                        // 包含的锚点
    pub proposer: String,                      // 提议者
    pub status: CFStatus,                      // 状态
    pub votes: HashMap<String, Vote>,          // 投票记录
    pub created_at: u64,                       // 创建时间
    pub finalized_at: Option<u64>,             // 最终确认时间
}

pub enum CFStatus {
    Proposed,   // 已提议
    Voting,     // 投票中
    Approved,   // 已批准
    Finalized,  // 已最终确认
    Rejected,   // 已拒绝
}

pub struct Vote {
    pub validator_id: String,
    pub cf_id: CFId,
    pub approve: bool,
    pub signature: Vec<u8>,
    pub timestamp: u64,
}
浏览器展示要点：
- CF 状态和进度
- 提议者和投票者列表
- 投票结果（赞成/反对）
- 时间线（提议 → 投票 → 最终确认）
3. 浏览器 API 接口设计
目前接口还没有，只是根据代码和单元测试模拟的返回数据
3.1 首页统计数据
GET /api/v1/explorer/stats
{
  "network": {
    "total_anchors": 12345,           // 总锚点数
    "total_events": 567890,           // 总事件数
    "total_validators": 10,           // Validator 数量
    "total_solvers": 25,              // Solver 数量
    "tps": 1234.5,                    // 当前 TPS
    "avg_anchor_time": 5.2            // 平均锚点间隔（秒）
  },
  "latest_anchor": {
    "id": "anchor_abc123...",
    "depth": 12345,
    "event_count": 150,
    "timestamp": 1706342400000,
    "vlc_time": 123450
  },
  "recent_activity": {
    "last_24h_events": 125000,
    "last_24h_transfers": 98000,
    "last_24h_registrations": 50
  }
}
3.2 Anchor列表
GET /api/v1/explorer/anchors?page=1&limit=20
{
  "anchors": [
    {
      "id": "anchor_abc123...",
      "depth": 12345,
      "event_count": 150,
      "timestamp": 1706342400000,
      "vlc_time": 123450,
      "proposer": "validator-1",
      "status": "finalized",
      "state_root": "0x1234..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12345,
    "total_pages": 618
  }
}
3.3  Anchor详情
GET /api/v1/explorer/anchor/{anchor_id}
{
  "id": "anchor_abc123...",
  "depth": 12345,
  "timestamp": 1706342400000,
  "vlc_snapshot": {
    "logical_time": 123450,
    "physical_time": 1706342400000
  },
  "previous_anchor": "anchor_xyz789...",
  "next_anchor": "anchor_def456...",
  "event_ids": ["event_1", "event_2", "..."],
  "event_count": 150,
  "merkle_roots": {
    "global_state_root": "0x1234...",
    "events_root": "0x5678...",
    "anchor_chain_root": "0x9abc...",
    "subnet_roots": {
      "ROOT": "0xdef0...",
      "subnet-1": "0x1111..."
    }
  },
  "consensus_frame": {
    "id": "cf_123...",
    "proposer": "validator-1",
    "status": "finalized",
    "votes": [
      {
        "validator_id": "validator-1",
        "approve": true,
        "timestamp": 1706342395000
      }
    ],
    "finalized_at": 1706342400000
  },
  "statistics": {
    "transfer_count": 120,
    "registration_count": 5,
    "system_event_count": 25
  }
}
3.4 事件列表
GET /api/v1/explorer/events?page=1&limit=50&type=Transfer&status=Finalized
{
  "events": [
    {
      "id": "event_abc123...",
      "type": "Transfer",
      "status": "Finalized",
      "creator": "solver-1",
      "timestamp": 1706342395000,
      "vlc_time": 123449,
      "anchor_id": "anchor_abc123...",
      "anchor_depth": 12345,
      "parent_count": 2,
      "summary": "Transfer 100 FLUX from alice to bob"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 567890,
    "total_pages": 11358
  }
}
3.5 事件详情
GET /api/v1/explorer/event/{event_id}
{
  "id": "event_abc123...",
  "type": "Transfer",
  "status": "Finalized",
  "creator": "solver-1",
  "timestamp": 1706342395000,
  "vlc_snapshot": {
    "logical_time": 123449,
    "physical_time": 1706342395000
  },
  "parent_ids": ["event_parent1", "event_parent2"],
  "children_ids": ["event_child1", "event_child2"],
  "subnet_id": "ROOT",
  "anchor_id": "anchor_abc123...",
  "anchor_depth": 12345,
  "payload": {
    "Transfer": {
      "id": "tx-123",
      "from": "alice",
      "to": "bob",
      "amount": 100,
      "transfer_type": "FluxTransfer"
    }
  },
  "execution_result": {
    "success": true,
    "message": "TEE executed in 1234μs, 1 events processed",
    "state_changes": [
      {
        "key": "account:alice",
        "old_value": "1000",
        "new_value": "900"
      },
      {
        "key": "account:bob",
        "old_value": "500",
        "new_value": "600"
      }
    ]
  },
  "dag_visualization": {
    "depth": 5,
    "parent_depths": [4, 4],
    "children_count": 2
  }
}
3.6 账户信息
GET /api/v1/explorer/account/{address}
{
  "address": "alice",
  "balance": 1000,
  "profile": {
    "display_name": "Alice",
    "avatar_url": "https://...",
    "bio": "DeFi enthusiast"
  },
  "statistics": {
    "total_sent": 5000,
    "total_received": 6000,
    "transaction_count": 150,
    "first_seen": 1706000000000,
    "last_active": 1706342395000
  },
  "credentials": [
    {
      "type": "kyc",
      "level": "level_2",
      "issuer": "kyc_provider",
      "status": "Active"
    }
  ],
  "recent_events": [
    {
      "id": "event_abc123...",
      "type": "Transfer",
      "timestamp": 1706342395000,
      "summary": "Sent 100 FLUX to bob"
    }
  ]
}
3.7  Validator 列表
GET /api/v1/explorer/validators
{
  "validators": [
    {
      "validator_id": "validator-1",
      "address": "0xabcd...",
      "network_address": "127.0.0.1:9000",
      "status": "online",
      "stake_amount": 10000,
      "commission_rate": 10,
      "statistics": {
        "proposed_cfs": 1234,
        "approved_votes": 5678,
        "rejected_votes": 12,
        "uptime_percentage": 99.8
      },
      "registered_at": 1706000000000
    }
  ]
}
3.8 Solver 列表
GET /api/v1/explorer/solvers
{
  "solvers": [
    {
      "solver_id": "solver-1",
      "address": "0x1234...",
      "network_address": "127.0.0.1:9001",
      "status": "active",
      "capacity": 100,
      "current_load": 45,
      "shard_id": "shard-0",
      "resources": ["ETH", "BTC"],
      "statistics": {
        "total_events_processed": 12345,
        "success_rate": 99.5,
        "avg_execution_time_us": 1234
      },
      "registered_at": 1706000000000
    }
  ]
}
3.9 搜索接口
GET /api/v1/explorer/search?q={query}
支持搜索：
- Anchor ID
- Event ID
- Transfer ID
- Account Address
- Validator ID
- Solver ID
{
  "results": [
    {
      "type": "anchor",
      "id": "anchor_abc123...",
      "depth": 12345,
      "url": "/anchor/anchor_abc123..."
    },
    {
      "type": "event",
      "id": "event_abc123...",
      "event_type": "Transfer",
      "url": "/event/event_abc123..."
    }
  ]
}
3.10 DAG 可视化数据 
这个就是咱们的DAG结构，这部分你看需要不需要展示
GET /api/v1/explorer/dag/events?anchor_id={anchor_id}&depth=3
返回指定Anchor周围的 DAG 结构，用于前端可视化：
{
  "nodes": [
    {
      "id": "event_1",
      "type": "Transfer",
      "status": "Finalized",
      "depth": 5,
      "timestamp": 1706342395000
    }
  ],
  "edges": [
    {
      "from": "event_parent1",
      "to": "event_1",
      "type": "parent"
    }
  ],
  "anchor_boundaries": [
    {
      "anchor_id": "anchor_abc123...",
      "depth": 12345,
      "event_ids": ["event_1", "event_2"]
    }
  ]
}
4. 因果关系展示
4.1 事件因果链
Setu 的核心特性是 DAG 结构，每个事件都有父事件，形成因果关系：
比如：
Event A (depth=1)
    ↓
Event B (depth=2) ← Event C (depth=2)
    ↓                    ↓
    └──────→ Event D (depth=3)
浏览器展示：
1. 事件详情页显示父事件和子事件
2. DAG 可视化图展示事件之间的依赖关系
3. 深度标识显示事件在 DAG 中的拓扑位置
4.2 Anchor链
Anchor形成线性链，类似传统区块链：
Anchor 0 (Genesis)
    ↓
Anchor 1 (depth=1, 100 events)
    ↓
Anchor 2 (depth=2, 150 events)
    ↓
Anchor 3 (depth=3, 120 events)
浏览器展示：
1. 锚点列表按深度排序
2. 锚点详情显示前后锚点链接
3. 时间线视图展示锚点创建历史
4.3  共识过程
1. Validator-1 提议 CF (包含 Anchor)
    ↓
2. Validator-2, Validator-3 投票
    ↓
3. 达到 2/3 多数 → Approved
    ↓
4. Finalized → 写入锚点链
浏览器展示：
1. CF 详情页显示投票进度
2. 投票记录显示每个 Validator 的投票
3. 时间线展示共识过程

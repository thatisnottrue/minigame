const DEFAULT_BOARD_SIZE = 11;
const TRACE_START_POINT = { x: 3, y: 3 };
const leftFoodItems = [
  "가시연",
  "연테두리진딧물",
  "실잠자리",
  "참개구리",
  "녹조류",
  "송사리",
  "모든 생물의 사체"
];

const rightFoodItems = [
  "연테두리진딧물",
  "실잠자리",
  "참개구리",
  "물장군",
  "송사리",
  "수달",
  "미생물(메탄생성균)"
];

const foodWebAnswerPairs = [
  ["가시연", "연테두리진딧물"],
  ["연테두리진딧물", "실잠자리"],
  ["실잠자리", "참개구리"],
  ["참개구리", "물장군"],
  ["녹조류", "송사리"],
  ["송사리", "수달"],
  ["모든 생물의 사체", "미생물(메탄생성균)"]
];

const plantInsectTracePath = [
  {
    x: 8,
    y: 3,
    label: "가시연 부활",
    autoSegments: [{ from: { x: 4, y: 6 }, to: { x: 4, y: 8 } }]
  },
  {
    x: 8,
    y: 6,
    label: "연테두리진딧물 증가"
  },
  {
    x: 2,
    y: 9,
    label: "물장군 사냥 활성화",
    traceMode: "none",
    autoSegments: [{ from: { x: 6, y: 6 }, to: { x: 6, y: 8 } }]
  },
  {
    x: 9,
    y: 9,
    label: "생태계 회복 완료"
  }
];

const microFishTracePath = [
  { x: 3, y: 1, label: "돌말류/녹조류 광합성 활성화" },
  { x: 5, y: 1, label: "송사리/큰가시고기 먹이 풍부" },
  { x: 9, y: 4, label: "대형 포식자 평형 조절" },
  { x: 7, y: 7, label: "유기물 분해 물질 순환 완료" },
  { x: 7, y: 10, label: "학 완성" }
];

const microFishStrokePlan = [
  {
    from: { x: 5, y: 1 },
    to: { x: 3, y: 1 },
    direction: "left",
    checkpointIndex: 0,
    autoMove: { to: { x: 3, y: 0 } },
    warpTo: { x: 7, y: 1 }
  },
  {
    from: { x: 7, y: 1 },
    to: { x: 5, y: 1 },
    direction: "left",
    checkpointIndex: 1,
    autoMove: { to: { x: 5, y: 2 } },
    warpTo: { x: 1, y: 4 }
  },
  {
    from: { x: 1, y: 4 },
    to: { x: 9, y: 4 },
    direction: "right",
    checkpointIndex: 2,
    warpTo: { x: 5, y: 7 }
  },
  {
    from: { x: 5, y: 7 },
    to: { x: 7, y: 7 },
    direction: "right",
    checkpointIndex: 3
  },
  {
    from: { x: 7, y: 7 },
    to: { x: 7, y: 10 },
    direction: "down",
    checkpointIndex: 4,
    completesStage: true
  }
];

// 에러 방지를 위해 필요한 유틸리티 함수들을 상위로 끌어올림
function cellKey(point) {
  return `${point.x},${point.y}`;
}

function edgeKey(from, to) {
  return `${from}→${to}`;
}

function buildFoodWebAnswerEdges() {
  return new Set(foodWebAnswerPairs.map(([from, to]) => edgeKey(from, to)));
}

function buildDenseMicroFishTraps() {
  const wrongLabels = [
    "짚신벌레류 증식",
    "짚신벌레류 먹이망 교란",
    "짚신벌레류 산소 고갈",
    "짚신벌레류 광합성 오판"
  ];
  const safeCells = new Set([
    cellKey({ x: 5, y: 1 }),
    cellKey({ x: 4, y: 1 }),
    cellKey({ x: 3, y: 1 }),
    cellKey({ x: 3, y: 0 }),
    cellKey({ x: 7, y: 1 }),
    cellKey({ x: 6, y: 1 }),
    cellKey({ x: 5, y: 2 }),
    cellKey({ x: 1, y: 4 }),
    cellKey({ x: 2, y: 4 }),
    cellKey({ x: 3, y: 4 }),
    cellKey({ x: 4, y: 4 }),
    cellKey({ x: 5, y: 4 }),
    cellKey({ x: 6, y: 4 }),
    cellKey({ x: 7, y: 4 }),
    cellKey({ x: 8, y: 4 }),
    cellKey({ x: 9, y: 4 }),
    cellKey({ x: 5, y: 7 }),
    cellKey({ x: 6, y: 7 }),
    cellKey({ x: 7, y: 7 }),
    cellKey({ x: 7, y: 8 }),
    cellKey({ x: 7, y: 9 }),
    cellKey({ x: 7, y: 10 })
  ]);
  const traps = [];

  for (let y = 0; y < DEFAULT_BOARD_SIZE; y += 1) {
    for (let x = 0; x < DEFAULT_BOARD_SIZE; x += 1) {
      if (safeCells.has(cellKey({ x, y }))) continue;
      traps.push({
        x,
        y,
        label: wrongLabels[(x + y * DEFAULT_BOARD_SIZE) % wrongLabels.length]
      });
    }
  }

  return traps;
}

// 순서가 맞춰진 후 정상 변수 초기화 진행
const foodWebAnswerEdges = buildFoodWebAnswerEdges();
const pyramidOrder = ["생산자 1000", "1차 소비자 100", "2차 소비자 10", "최상위 소비자 1"];

const roleData = {
  "1004": {
    code: "1004",
    roleName: "식물·곤충 전문가",
    badge: "식물·곤충",
    resultLetters: ["교"],
    boardSize: 11,
    start: { x: 3, y: 3 },
    initialNextIndex: 0,
    path: plantInsectTracePath,
    traps: [
      { x: 0, y: 0, label: "식물 즙액 감소" },
      { x: 10, y: 0, label: "진딧물 급감" },
      { x: 0, y: 10, label: "실잠자리 유충 전멸" },
      { x: 10, y: 10, label: "물장군 사냥 중단" },
      { x: 0, y: 5, label: "습지 먹이원 단절" },
      { x: 10, y: 5, label: "천적 균형 붕괴" }
    ],
    hint: "1. 당신이 미로에서 완성한 글자 [ 교 ]는 최종 장소 이름의 '첫 번째 글자'입니다.\n2. [함정 해제 단서]: 조류·포유류 대원의 화면에 글자가 두 개 떠서 혼란을 겪고 있습니다. 조류·포유류 대원에게 '황소개구리(교란종) 경로는 가짜이며, 오직 잉어를 주식으로 삼는 수중생활 포유류(수달)의 정답 경로로 만들어진 글자만 진짜'라고 알려주십시오!"
  },
  "2005": {
    code: "2005",
    roleName: "미생물·어류 전문가",
    badge: "미생물·어류",
    resultLetters: ["학"],
    boardSize: 11,
    start: { x: 5, y: 1 },
    traceAlgorithm: "microFishHangul",
    initialNextIndex: 0,
    path: microFishTracePath,
    strokePlan: microFishStrokePlan,
    traps: buildDenseMicroFishTraps(),
    hint: "1. 당신이 미로에서 완성한 글자 [ 학 ]는 최종 장소 이름의 '두 번째 글자'입니다.\n2. [사용 방법]: 당신이 찾은 글자 앞뒤에 다른 대원이 찾아낸 글자를 결합해 최종 장소를 도출하십시오."
  },
  "3006": {
    code: "3006",
    roleName: "조류·포유류 전문가",
    badge: "조류·포유류",
    resultLetters: ["실", "방"],
    path: [
      { x: 1, y: 9, label: "어류 자원 풍부" },
      { x: 3, y: 7, label: "수달(포유류) 정착" },
      { x: 5, y: 5, label: "너구리/백로 습지 사냥 부활" },
      { x: 7, y: 3, label: "습지 생물다양성 증가" }
    ],
    fakePath: [
      { x: 9, y: 9, label: "습지 환경 오염" },
      { x: 9, y: 7, label: "황소개구리 유입" },
      { x: 8, y: 5, label: "토종 생태계 교란" },
      { x: 8, y: 3, label: "습지 평형 파괴" }
    ],
    traps: [],
    hint: "1. 당신의 화면에는 생태계 교란 데이터가 섞여 있어 두 개의 글자([ 실 ], [ 방 ])가 보입니다.\n2. 어떤 글자가 진짜 최종 장소의 단어인지 판단할 수 있는 열쇠는 오직 '식물·곤충 전문가'의 화면에만 적혀 있습니다. 동료에게 당신의 진짜 글자가 무엇인지 즉시 물어보십시오!"
  }
};

const stageCopy = [
  {
    title: "STAGE 1 - 먹이그물 잇기",
    description: "왼쪽 피식자와 오른쪽 포식자/분해자 노드를 1:1로 이어 총 7개의 먹이사슬을 완성하세요. 정답 선은 연한 초록색으로 고정되고, 오답 선은 빨간색으로 깜빡인 뒤 사라집니다."
  },
  {
    title: "STAGE 2 - 인과관계 궤적",
    description: "캐릭터를 상/하/좌/우로 움직여 활동지에서 도출한 생태학적 연쇄 반응 노드를 순서대로 밟으세요. 오답 노드에 닿으면 이 스테이지가 리셋됩니다."
  },
  {
    title: "STAGE 3 - 생태 피라미드",
    description: "영양 단계별 에너지 법칙에 맞게 블록을 아래에서 위로 쌓아 올리세요."
  }
];

const state = {
  role: null,
  stageIndex: 0,
  player: { ...TRACE_START_POINT },
  nextIndex: 0,
  tracePoints: [],
  traceSegments: [],
  strokeStart: { ...TRACE_START_POINT },
  strokePlanIndex: 0,
  traceComplete: false,
  foodConnections: [],
  selectedFoodNodes: { left: null, right: null },
  shuffledLeftItems: [],
  shuffledRightItems: [],
  activeDrag: null,
  suppressPointerClick: false,
  pyramidPlacements: []
};

const elements = {
  startScreen: document.querySelector("#start-screen"),
  gameScreen: document.querySelector("#game-screen"),
  resultScreen: document.querySelector("#result-screen"),
  form: document.querySelector("#passcode-form"),
  passcodeInput: document.querySelector("#passcode-input"),
  passcodeError: document.querySelector("#passcode-error"),
  stageNumber: document.querySelector("#stage-number"),
  stageTitle: document.querySelector("#stage-title"),
  stageDescription: document.querySelector("#stage-description"),
  nextNodeWrap: document.querySelector("#next-node-wrap"),
  nextNode: document.querySelector("#next-node"),
  roleBadge: document.querySelector("#role-badge"),
  stageOne: document.querySelector("#stage-one"),
  stageTwo: document.querySelector("#stage-two"),
  stageThree: document.querySelector("#stage-three"),
  dropLane: document.querySelector("#drop-lane"),
  cardBank: document.querySelector("#card-bank"),
  checkFoodWeb: document.querySelector("#check-food-web"),
  resetFoodWeb: document.querySelector("#reset-food-web"),
  board: document.querySelector("#game-board"),
  boardWrap: document.querySelector("#board-wrap"),
  traceLayer: document.querySelector("#trace-layer"),
  stageClearPopup: document.querySelector("#stage-clear-popup"),
  stageClearMessage: document.querySelector("#stage-clear-popup p"),
  enterStageThree: document.querySelector("#enter-stage-three"),
  skipStage: document.querySelector("#skip-stage"),
  pyramidStack: document.querySelector("#pyramid-stack"),
  pyramidBank: document.querySelector("#pyramid-bank"),
  resetPyramid: document.querySelector("#reset-pyramid"),
  toast: document.querySelector("#toast"),
  finalLetter: document.querySelector("#final-letter"),
  resultMessage: document.querySelector("#result-message"),
  roleHint: document.querySelector("#role-hint"),
  restartButton: document.querySelector("#restart-button"),
  copyAnswer: document.querySelector("#copy-answer")
};

function normalizePasscode(value) {
  return value
    .normalize("NFKC")
    .replace(/\D/g, "");
}

function getRoleByPasscode(value) {
  const passcode = normalizePasscode(value);
  return { passcode, role: roleData[passcode] || null };
}

function startGameFromPasscode(value) {
  const { passcode, role } = getRoleByPasscode(value);

  if (!passcode) {
    elements.passcodeError.textContent = "패스코드 숫자를 입력하세요.";
    elements.passcodeInput.focus();
    return;
  }

  if (!role) {
    elements.passcodeError.textContent = "등록되지 않은 패스코드입니다. 1004, 2005, 3006 중 하나를 입력하세요.";
    elements.passcodeInput.focus();
    return;
  }

  elements.passcodeInput.value = passcode;
  elements.passcodeError.textContent = "";
  beginGame(role);
}

function showScreen(screenName) {
  elements.startScreen.classList.toggle("is-hidden", screenName !== "start");
  elements.gameScreen.classList.toggle("is-hidden", screenName !== "game");
  elements.resultScreen.classList.toggle("is-hidden", screenName !== "result");
}

function getBoardSize(role = state.role) {
  return role ? (role.boardSize || DEFAULT_BOARD_SIZE) : DEFAULT_BOARD_SIZE;
}

function getTraceStart(role = state.role) {
  return role ? (role.start || { ...TRACE_START_POINT }) : { ...TRACE_START_POINT };
}

function getInitialNextIndex(role = state.role) {
  return role ? (role.initialNextIndex ?? 0) : 0;
}

function beginGame(role) {
  state.role = role;
  state.stageIndex = 0;
  state.player = getTraceStart(role);
  state.nextIndex = getInitialNextIndex(role);
  state.tracePoints = [cellCenter(state.player)];
  state.traceSegments = [];
  state.strokeStart = { ...state.player };
  state.strokePlanIndex = 0;
  state.traceComplete = false;
  state.foodConnections = [];
  clearFoodSelection();
  state.shuffledLeftItems = shuffle(leftFoodItems);
  state.shuffledRightItems = shuffle(rightFoodItems);
  state.activeDrag = null;
  state.suppressPointerClick = false;
  state.pyramidPlacements = [];
  elements.roleBadge.textContent = role.badge;
  showScreen("game");
  renderStage();
}

function renderStage() {
  const copy = stageCopy[state.stageIndex];
  elements.stageNumber.textContent = String(state.stageIndex + 1);
  elements.stageTitle.textContent = copy.title;
  elements.stageDescription.textContent = copy.description;
  elements.stageOne.classList.toggle("is-hidden", state.stageIndex !== 0);
  elements.stageTwo.classList.toggle("is-hidden", state.stageIndex !== 1);
  elements.stageThree.classList.toggle("is-hidden", state.stageIndex !== 2);
  elements.nextNodeWrap.classList.toggle("is-hidden", state.stageIndex !== 1);
  elements.skipStage.textContent = state.stageIndex < 2 ? `STAGE ${state.stageIndex + 1} 스킵` : "결과 화면으로 스킵";
  if (state.stageIndex !== 1) {
    elements.boardWrap.classList.remove("is-complete");
    elements.stageClearPopup.classList.add("is-hidden");
    elements.enterStageThree.disabled = true;
  }

  if (state.stageIndex === 0) renderFoodWeb();
  if (state.stageIndex === 1) renderTraceStage();
  if (state.stageIndex === 2) renderPyramid();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function parseEdgeKey(key) {
  const [from, to] = key.split("→");
  return { from, to };
}

function renderFoodWeb() {
  const completeCount = state.foodConnections.length;
  const totalCount = foodWebAnswerEdges.size;
  const isComplete = completeCount === totalCount;

  elements.dropLane.innerHTML = "";
  elements.dropLane.className = "drop-lane match-status-lane";

  const summary = document.createElement("div");
  summary.className = "food-web-summary match-summary";
  summary.innerHTML = `
    <strong>연결 현황 <span id="food-match-count">${completeCount} / ${totalCount}</span></strong>
    <span>왼쪽 피식자와 오른쪽 포식자/분해자를 드래그 앤 드롭하거나 연속 클릭해 두꺼운 선으로 연결하세요.</span>
  `;
  elements.dropLane.appendChild(summary);

  elements.cardBank.innerHTML = "";
  elements.cardBank.className = "card-bank match-board";
  elements.cardBank.setAttribute("aria-label", "좌우 1:1 먹이사슬 매칭 보드");

  const linkLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  linkLayer.classList.add("food-link-layer");
  linkLayer.setAttribute("aria-hidden", "true");
  elements.cardBank.appendChild(linkLayer);

  elements.cardBank.appendChild(createFoodColumn("left", "피식자", state.shuffledLeftItems));
  elements.cardBank.appendChild(createFoodColumn("right", "포식자 / 분해자", state.shuffledRightItems));

  const popup = document.createElement("div");
  popup.className = `stage-one-clear-popup${isComplete ? "" : " is-hidden"}`;
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-live", "polite");
  popup.innerHTML = `
    <h3>STAGE 1 CLEAR!</h3>
    <p>7개의 먹이사슬을 모두 정확히 연결했습니다. STAGE 2 진입 버튼이 활성화되었습니다.</p>
  `;
  elements.dropLane.appendChild(popup);

  elements.checkFoodWeb.textContent = "STAGE 2 진입";
  elements.checkFoodWeb.disabled = !isComplete;
  elements.checkFoodWeb.classList.toggle("stage-entry-ready", isComplete);

  window.requestAnimationFrame(drawFoodConnections);
}

function createFoodColumn(side, title, items) {
  const column = document.createElement("section");
  column.className = `match-column ${side}-column`;
  column.setAttribute("aria-label", title);

  const heading = document.createElement("h3");
  heading.textContent = title;
  column.appendChild(heading);

  const list = document.createElement("div");
  list.className = "match-node-list";

  items.forEach((label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "match-node";
    button.textContent = label;
    const nodeId = getFoodNodeId(side, label);
    button.dataset.side = side;
    button.dataset.label = label;
    button.dataset.nodeId = nodeId;
    const isSelected = state.selectedFoodNodes[side] === label;
    button.setAttribute("aria-pressed", String(isSelected));

    if (isSelected) button.classList.add("selected");
    if (isFoodNodeCompleted(label, side)) button.classList.add("completed");

    button.addEventListener("click", () => {
      if (state.suppressPointerClick) return;
      chooseFoodNode(label, side);
    });
    if (side === "left") {
      button.addEventListener("pointerdown", (event) => startFoodDrag(event, label));
    }

    list.appendChild(button);
  });

  column.appendChild(list);
  return column;
}

function chooseFoodNode(label, side) {
  if (isFoodNodeCompleted(label, side)) {
    showToast(`${label}: 이미 정답 연결이 고정되었습니다.`, true);
    return;
  }

  state.selectedFoodNodes[side] = state.selectedFoodNodes[side] === label ? null : label;

  const { left, right } = state.selectedFoodNodes;
  if (left && right) {
    placeFoodConnection(left, right);
    return;
  }

  renderFoodWeb();
  if (state.selectedFoodNodes.left) {
    showToast(`${state.selectedFoodNodes.left}: 피식자로 선택했습니다. 오른쪽 노드를 클릭하거나 드래그해 연결하세요.`, true);
  } else if (state.selectedFoodNodes.right) {
    showToast(`${state.selectedFoodNodes.right}: 포식자/분해자로 선택했습니다. 왼쪽 피식자 노드를 클릭해 연결하세요.`, true);
  }
}

function placeFoodConnection(from, to) {
  const key = edgeKey(from, to);
  clearFoodSelection();

  if (!foodWebAnswerEdges.has(key)) {
    renderFoodWeb();
    window.requestAnimationFrame(() => flashFoodConnection(getMatchNode("left", from), getMatchNode("right", to), "wrong"));
    showToast(`${from} ➜ ${to} 연결은 정답 먹이사슬이 아닙니다.`, false);
    return;
  }

  if (state.foodConnections.includes(key)) {
    renderFoodWeb();
    showToast("이미 연결한 먹이사슬입니다.", false);
    return;
  }

  state.foodConnections.push(key);
  renderFoodWeb();
  showToast(`${from} ➜ ${to} 연결 성공`, true);

  if (state.foodConnections.length === foodWebAnswerEdges.size) {
    showToast("STAGE 1 CLEAR! STAGE 2 진입 버튼이 활성화되었습니다.", true);
  }
}

function startFoodDrag(event, label) {
  if (isFoodNodeCompleted(label, "left")) return;

  event.preventDefault();
  state.selectedFoodNodes.left = label;
  state.selectedFoodNodes.right = null;
  state.activeDrag = { from: label };
  state.suppressPointerClick = true;
  renderFoodWeb();

  const move = (moveEvent) => drawTempFoodLine(label, moveEvent.clientX, moveEvent.clientY);
  const up = (upEvent) => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);

    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest?.('.match-node[data-side="right"]');
    state.activeDrag = null;

    if (target?.dataset.label) {
      placeFoodConnection(label, target.dataset.label);
    } else {
      state.selectedFoodNodes.left = label;
      state.selectedFoodNodes.right = null;
      renderFoodWeb();
    }

    window.setTimeout(() => {
      state.suppressPointerClick = false;
    }, 0);
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up, { once: true });
  drawTempFoodLine(label, event.clientX, event.clientY);
}

function drawFoodConnections() {
  const layer = getFoodLinkLayer();
  if (!layer) return;
  syncFoodLinkLayerSize(layer);
  layer.innerHTML = "";

  state.foodConnections.forEach((key) => {
    const { from, to } = parseEdgeKey(key);
    const fromNode = getMatchNode("left", from);
    const toNode = getMatchNode("right", to);
    if (fromNode && toNode) appendFoodLine(layer, fromNode, toNode, "correct");
  });
}

function drawTempFoodLine(from, clientX, clientY) {
  const layer = getFoodLinkLayer();
  const fromNode = getMatchNode("left", from);
  if (!layer || !fromNode) return;

  drawFoodConnections();
  syncFoodLinkLayerSize(layer);
  const start = getNodeAnchor(fromNode, "right");
  const boardRect = elements.cardBank.getBoundingClientRect();
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.classList.add("food-line", "pending");
  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", clientX - boardRect.left);
  line.setAttribute("y2", clientY - boardRect.top);
  layer.appendChild(line);
}

function flashFoodConnection(fromNode, toNode, status) {
  const layer = getFoodLinkLayer();
  if (!layer || !fromNode || !toNode) return;
  const line = appendFoodLine(layer, fromNode, toNode, status);
  window.setTimeout(() => line.remove(), 520);
}

function appendFoodLine(layer, fromNode, toNode, status) {
  syncFoodLinkLayerSize(layer);
  const start = getNodeAnchor(fromNode, "right");
  const end = getNodeAnchor(toNode, "left");
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.classList.add("food-line", status);
  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", end.x);
  line.setAttribute("y2", end.y);
  layer.appendChild(line);
  return line;
}

function getFoodLinkLayer() {
  return elements.cardBank.querySelector(".food-link-layer");
}

function getFoodNodeId(side, label) {
  return `${side}:${label}`;
}

function getMatchNode(side, label) {
  return elements.cardBank.querySelector(`.match-node[data-node-id="${CSS.escape(getFoodNodeId(side, label))}"]`);
}

function getNodeAnchor(node, horizontalSide) {
  const boardRect = elements.cardBank.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  const x = horizontalSide === "right" ? nodeRect.right - boardRect.left : nodeRect.left - boardRect.left;
  return {
    x,
    y: nodeRect.top - boardRect.top + nodeRect.height / 2
  };
}

function syncFoodLinkLayerSize(layer) {
  const boardRect = elements.cardBank.getBoundingClientRect();
  layer.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);
  layer.setAttribute("width", String(boardRect.width));
  layer.setAttribute("height", String(boardRect.height));
}

function clearFoodSelection() {
  state.selectedFoodNodes.left = null;
  state.selectedFoodNodes.right = null;
}

function isFoodNodeCompleted(node, side) {
  if (side === "left") return state.foodConnections.some((key) => parseEdgeKey(key).from === node);
  return state.foodConnections.some((key) => parseEdgeKey(key).to === node);
}

function checkFoodWeb() {
  if (state.foodConnections.length !== foodWebAnswerEdges.size) {
    showToast(`아직 ${foodWebAnswerEdges.size - state.foodConnections.length}개 연결이 남았습니다.`, false);
    return;
  }

  showToast("경포가시연습지 먹이사슬 매칭 성공! 인과관계 궤적으로 이동합니다.", true);
  goToStage(1);
}

function resetFoodWeb() {
  state.foodConnections = [];
  clearFoodSelection();
  state.activeDrag = null;
  state.suppressPointerClick = false;
  state.shuffledLeftItems = shuffle(leftFoodItems);
  state.shuffledRightItems = shuffle(rightFoodItems);
  renderFoodWeb();
}

function cellCenter(point) {
  return { x: point.x + 0.5, y: point.y + 0.5 };
}

function renderTraceStage() {
  const role = state.role;
  const boardSize = getBoardSize(role);
  const start = getTraceStart(role);
  const usesPrecisionStroke = role.traceAlgorithm === "microFishHangul";
  const pathByCell = new Map(role.path.map((node, index) => [cellKey(node), { ...node, index, kind: "node" }]));
  const trapByCell = new Map(role.traps.map((trap) => [cellKey(trap), { ...trap, kind: "trap" }]));
  const fakeByCell = new Map((role.fakePath || []).map((node, index) => [cellKey(node), { ...node, index, kind: "fake" }]));

  elements.nextNode.textContent = role.path[state.nextIndex]?.label || "STAGE 3 진입 가능";
  elements.board.innerHTML = "";
  elements.board.style.setProperty("--board-size", boardSize);
  elements.boardWrap.style.setProperty("--board-size", boardSize);
  elements.boardWrap.classList.toggle("is-complete", state.traceComplete);
  const completedLetters = role.resultLetters.join(" / ");
  elements.stageClearPopup.classList.toggle("is-minimal", usesPrecisionStroke);
  elements.stageClearMessage.textContent = usesPrecisionStroke
    ? ""
    : `붉은 플레이어 선과 파란 시스템 보조선으로 한글 '${completedLetters}'가 완성되었습니다.`;
  elements.enterStageThree.textContent = usesPrecisionStroke
    ? "STAGE 3 진입"
    : `완성된 '${completedLetters}' 확인 완료 - STAGE 3 진입`;
  elements.stageClearPopup.classList.toggle("is-hidden", !state.traceComplete);
  elements.enterStageThree.disabled = !state.traceComplete;

  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const key = `${x},${y}`;
      const pathNode = pathByCell.get(key);
      const fakeNode = fakeByCell.get(key);
      const trapNode = trapByCell.get(key);
      const cell = document.createElement("div");
      cell.className = "cell";

      if (x === start.x && y === start.y) {
        cell.classList.add("start-cell");
        if (!usesPrecisionStroke) cell.textContent = "출발";
      }

      if (pathNode) {
        cell.classList.add("node");
        cell.textContent = usesPrecisionStroke ? "" : pathNode.label;
        cell.title = pathNode.label;
        if (pathNode.index < state.nextIndex) cell.classList.add("is-done");
        if (pathNode.index === state.nextIndex) cell.classList.add("is-next");
      }

      if (fakeNode) {
        cell.classList.add("fake-node");
        cell.textContent = usesPrecisionStroke ? "" : fakeNode.label;
        cell.title = fakeNode.label;
      }

      if (trapNode) {
        cell.classList.add("trap");
        cell.textContent = usesPrecisionStroke ? "" : trapNode.label;
        cell.title = trapNode.label;
      }

      if (x === state.player.x && y === state.player.y) cell.classList.add("player");
      elements.board.appendChild(cell);
    }
  }

  drawTrace();
}

function drawTrace() {
  const boardSize = getBoardSize();
  elements.traceLayer.setAttribute("viewBox", `0 0 ${boardSize} ${boardSize}`);
  elements.traceLayer.innerHTML = "";

  state.traceSegments.forEach((segment) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", segment.from.x);
    line.setAttribute("y1", segment.from.y);
    line.setAttribute("x2", segment.to.x);
    line.setAttribute("y2", segment.to.y);
    line.setAttribute("vector-effect", "non-scaling-stroke");
    line.classList.add(segment.kind === "system" ? "system-trace" : "player-trace");
    elements.traceLayer.appendChild(line);
  });
}

function addTraceSegment(from, to, kind = "player") {
  state.traceSegments.push({
    from: cellCenter(from),
    to: cellCenter(to),
    kind
  });
}

function getCurrentLegStart(role = state.role) {
  if (state.nextIndex === 0) return getTraceStart(role);
  const previousNode = role.path[state.nextIndex - 1];
  return { x: previousNode.x, y: previousNode.y };
}

function addCompletedTraceLeg(node) {
  if (!node || node.traceMode === "none") return;
  addTraceSegment(getCurrentLegStart(), node);
}

function movePlayer(direction) {
  if (state.stageIndex !== 1 || state.traceComplete) return;
  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const delta = deltas[direction];
  if (!delta) return;

  const boardSize = getBoardSize();
  const nextPosition = { x: state.player.x + delta.x, y: state.player.y + delta.y };
  if (nextPosition.x < 0 || nextPosition.y < 0 || nextPosition.x >= boardSize || nextPosition.y >= boardSize) {
    showToast("그리드 밖으로는 이동할 수 없습니다.", false);
    return;
  }

  const previousPosition = { ...state.player };
  state.player = nextPosition;

  if (state.role.traceAlgorithm === "microFishHangul") {
    evaluateMicroFishTraceMove(previousPosition, nextPosition, direction);
  } else {
    evaluateTraceCell();
  }

  renderTraceStage();
}

function evaluateMicroFishTraceMove(previousPosition, nextPosition, direction) {
  const role = state.role;
  const currentLeg = role.strokePlan[state.strokePlanIndex];

  if (!currentLeg || direction !== currentLeg.direction) {
    resetTraceStage("정해진 획순 방향과 다릅니다. 최초 위치에서 다시 시작하세요.");
    return;
  }

  if (!isPointOnStrokeLeg(previousPosition, currentLeg) || !isPointOnStrokeLeg(nextPosition, currentLeg)) {
    resetTraceStage("정답 경로 밖의 짚신벌레류 위장 노드와 충돌했습니다!");
    return;
  }

  addTraceSegment(previousPosition, nextPosition, "player");

  if (cellKey(nextPosition) !== cellKey(currentLeg.to)) return;

  const checkpoint = role.path[currentLeg.checkpointIndex];
  if (checkpoint) {
    state.nextIndex = Math.max(state.nextIndex, currentLeg.checkpointIndex + 1);
    showToast(`정답 인과관계 확인: ${checkpoint.label}`, true);
  }

  if (currentLeg.autoMove) {
    addTraceSegment(nextPosition, currentLeg.autoMove.to, "player");
    state.player = { ...currentLeg.autoMove.to };
  }

  if (currentLeg.completesStage) {
    completeTraceStage();
    return;
  }

  if (currentLeg.warpTo) {
    state.player = { ...currentLeg.warpTo };
  }

  state.strokePlanIndex += 1;
  state.strokeStart = { ...state.player };
}

function isPointOnStrokeLeg(point, leg) {
  const minX = Math.min(leg.from.x, leg.to.x);
  const maxX = Math.max(leg.from.x, leg.to.x);
  const minY = Math.min(leg.from.y, leg.to.y);
  const maxY = Math.max(leg.from.y, leg.to.y);

  return point.x >= minX
    && point.x <= maxX
    && point.y >= minY
    && point.y <= maxY
    && (leg.from.x === leg.to.x ? point.x === leg.from.x : point.y === leg.from.y);
}

function evaluateTraceCell() {
  const role = state.role;
  const playerKey = cellKey(state.player);
  const wrongNode = [...role.traps, ...(role.fakePath || [])].find((node) => cellKey(node) === playerKey);
  const touchedPathIndex = role.path.findIndex((node) => cellKey(node) === playerKey);
  const touchedFuturePathNode = touchedPathIndex > state.nextIndex;
  const nextNode = role.path[state.nextIndex];

  if (wrongNode || touchedFuturePathNode) {
    resetTraceStage("생태계 인과관계가 맞지 않거나 잘못된 정보입니다!");
    return;
  }

  if (!nextNode || cellKey(nextNode) !== playerKey) return;

  addCompletedTraceLeg(nextNode);
  state.nextIndex += 1;
  state.strokeStart = { ...nextNode };
  addAutoTraceSegments(nextNode);
  showToast(`정답 인과관계 확인: ${nextNode.label}`, true);

  if (state.nextIndex >= role.path.length) {
    completeTraceStage();
  }
}

function addAutoTraceSegments(node) {
  (node.autoSegments || []).forEach((segment) => addTraceSegment(segment.from, segment.to, segment.kind || "system"));
}

function completeTraceStage() {
  state.traceComplete = true;
  showToast(`STAGE 2 CLEAR! 최종 '${state.role.resultLetters.join(" / ")}' 자 완성! STAGE 3 진입 버튼이 활성화되었습니다.`, true);
}

function resetTraceProgress() {
  const role = state.role;
  state.player = getTraceStart(role);
  state.nextIndex = getInitialNextIndex(role);
  state.tracePoints = [cellCenter(state.player)];
  state.traceSegments = [];
  state.strokeStart = { ...state.player };
  state.strokePlanIndex = 0;
  state.traceComplete = false;
}

function resetTraceStage(message) {
  resetTraceProgress();
  showToast(message, false);
}

function renderPyramid() {
  elements.nextNode.textContent = "-";
  elements.pyramidStack.innerHTML = "";
  pyramidOrder.forEach((label, index) => {
    const block = document.createElement("div");
    block.className = "pyramid-slot";
    block.textContent = state.pyramidPlacements[index] || `${index + 1}층`;
    if (state.pyramidPlacements[index]) block.classList.add("is-filled");
    elements.pyramidStack.prepend(block);
  });

  elements.pyramidBank.innerHTML = "";
  const remaining = pyramidOrder.filter((label) => !state.pyramidPlacements.includes(label));
  shuffle(remaining).forEach((label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pyramid-card";
    button.textContent = label;
    button.addEventListener("click", () => choosePyramidBlock(label));
    elements.pyramidBank.appendChild(button);
  });
}

function choosePyramidBlock(label) {
  const expected = pyramidOrder[state.pyramidPlacements.length];
  if (label !== expected) {
    state.pyramidPlacements = [];
    renderPyramid();
    showToast("피라미드가 무너졌습니다. 에너지가 가장 큰 단계부터 다시 쌓으세요.", false);
    return;
  }

  state.pyramidPlacements.push(label);
  renderPyramid();
  showToast(`${label} 배치 성공`, true);

  if (state.pyramidPlacements.length === pyramidOrder.length) {
    window.setTimeout(showResult, 300);
  }
}

function resetPyramid() {
  state.pyramidPlacements = [];
  renderPyramid();
}

function showResult() {
  const role = state.role;

  elements.finalLetter.textContent = role.resultLetters.join(" / ");
  elements.resultMessage.textContent = `${role.roleName} 세션으로 3개 스테이지를 모두 완수했습니다. 조원과 글자 및 함정 해제 단서를 조합해 최종 장소를 도출하세요.`;
  elements.roleHint.textContent = role.hint;
  showScreen("result");
}

function goToStage(index) {
  state.stageIndex = index;
  renderStage();
}

function skipCurrentStage() {
  if (state.stageIndex === 0) {
    state.foodConnections = [...foodWebAnswerEdges];
    showToast("STAGE 1을 건너뛰었습니다.", true);
    goToStage(1);
  } else if (state.stageIndex === 1) {
    state.traceComplete = true;
    showToast("STAGE 2를 건너뛰었습니다.", true);
    goToStage(2);
  } else if (state.stageIndex === 2) {
    state.pyramidPlacements = [...pyramidOrder];
    showToast("STAGE 3을 건너뛰었습니다.", true);
    showResult();
  }
}

let toastTimer;
function showToast(message, success) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.style.background = success ? "rgba(63, 143, 93, 0.96)" : "rgba(209, 73, 91, 0.96)";
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  startGameFromPasscode(elements.passcodeInput.value);
});

elements.passcodeInput.addEventListener("input", () => {
  elements.passcodeError.textContent = "";
});

document.querySelectorAll("[data-passcode]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.passcodeInput.value = button.dataset.passcode;
    startGameFromPasscode(button.dataset.passcode);
  });
});

document.addEventListener("keydown", (event) => {
  const keyMap = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right"
  };
  const direction = keyMap[event.code];
  if (!direction) return;
  event.preventDefault();
  movePlayer(direction);
});

document.querySelectorAll("[data-move]").forEach((button) => {
  button.addEventListener("click", () => movePlayer(button.dataset.move));
});

window.addEventListener("resize", () => {
  if (state.stageIndex === 0) drawFoodConnections();
});

elements.checkFoodWeb.addEventListener("click", checkFoodWeb);
elements.resetFoodWeb.addEventListener("click", resetFoodWeb);
elements.skipStage.addEventListener("click", skipCurrentStage);
elements.resetPyramid.addEventListener("click", resetPyramid);
elements.enterStageThree.addEventListener("click", () => {
  if (!state.traceComplete) return;
  showToast("생태 피라미드로 이동합니다.", true);
  goToStage(2);
});
elements.restartButton.addEventListener("click", () => {
  elements.passcodeInput.value = "";
  showScreen("start");
  elements.passcodeInput.focus();
});
elements.copyAnswer.addEventListener("click", () => showToast("정답 장소는 '과학실'입니다. 단, 조원끼리 근거를 설명해야 최종 해제 성공!", true));

const BOARD_SIZE = 11;
const STORAGE_KEY = "metaport-eco-best-connections";

const roles = {
  "ECO-TEACHER": {
    label: "교",
    name: "교육 설계 전문가",
    hint: "교 글자는 모든 조의 출발 원인을 비교하라는 뜻입니다. 같은 환경 변화에서 시작하지 않는 궤적은 함정일 가능성이 큽니다."
  },
  "ECO-FIELD": {
    label: "무",
    name: "현장 조사 전문가",
    hint: "무 글자는 현장에서 관찰 가능한 증거를 먼저 확인하라는 뜻입니다. 실제 생물 개체 수 변화로 이어지지 않는 설명을 걸러내세요."
  },
  "ECO-LAB": {
    label: "실",
    name: "자료 분석 전문가",
    hint: "실 글자는 실험·자료 기반의 연결만 남기라는 뜻입니다. 원인과 결과 사이에 측정 가능한 중간 단계가 빠진 주장을 의심하세요."
  }
};

const stages = [
  {
    title: "숲의 균형 회복",
    description: "햇빛과 생산자에서 시작해 먹이 그물의 회복으로 이어지는 순서를 찾으세요.",
    start: { x: 0, y: 10 },
    path: [
      { x: 1, y: 9, label: "햇빛" },
      { x: 2, y: 7, label: "식물" },
      { x: 4, y: 7, label: "초식" },
      { x: 5, y: 5, label: "포식" },
      { x: 7, y: 4, label: "균형" }
    ],
    traps: [
      { x: 2, y: 9, label: "남획" },
      { x: 5, y: 7, label: "외래종" },
      { x: 8, y: 5, label: "오염" }
    ]
  },
  {
    title: "습지 연쇄 반응",
    description: "수질 변화가 생물 다양성 변화로 이어지는 인과관계를 연결하세요.",
    start: { x: 7, y: 4 },
    path: [
      { x: 8, y: 3, label: "비" },
      { x: 8, y: 1, label: "수위" },
      { x: 6, y: 1, label: "수초" },
      { x: 4, y: 2, label: "곤충" },
      { x: 3, y: 4, label: "새" }
    ],
    traps: [
      { x: 9, y: 1, label: "폐수" },
      { x: 6, y: 3, label: "건조" },
      { x: 2, y: 3, label: "소음" }
    ]
  },
  {
    title: "도시 생태 통로",
    description: "서식지 회복이 이동과 번식 성공으로 이어지는 마지막 궤적을 완성하세요.",
    start: { x: 3, y: 4 },
    path: [
      { x: 2, y: 5, label: "숲길" },
      { x: 2, y: 7, label: "이동" },
      { x: 4, y: 8, label: "만남" },
      { x: 6, y: 8, label: "번식" },
      { x: 8, y: 9, label: "회복" }
    ],
    traps: [
      { x: 1, y: 6, label: "도로" },
      { x: 5, y: 7, label: "단절" },
      { x: 8, y: 7, label: "빛공해" }
    ]
  }
];

const state = {
  role: null,
  stageIndex: 0,
  player: { ...stages[0].start },
  nextIndex: 0,
  totalConnections: 0,
  bestConnections: Number(localStorage.getItem(STORAGE_KEY) || 0),
  tracePoints: []
};

const elements = {
  startScreen: document.querySelector("#start-screen"),
  gameScreen: document.querySelector("#game-screen"),
  resultScreen: document.querySelector("#result-screen"),
  form: document.querySelector("#passcode-form"),
  passcodeInput: document.querySelector("#passcode-input"),
  passcodeError: document.querySelector("#passcode-error"),
  board: document.querySelector("#game-board"),
  traceLayer: document.querySelector("#trace-layer"),
  stageNumber: document.querySelector("#stage-number"),
  stageTitle: document.querySelector("#stage-title"),
  stageDescription: document.querySelector("#stage-description"),
  nextNode: document.querySelector("#next-node"),
  roleBadge: document.querySelector("#role-badge"),
  connectionCount: document.querySelector("#connection-count"),
  bestCount: document.querySelector("#best-count"),
  toast: document.querySelector("#toast"),
  finalLetter: document.querySelector("#final-letter"),
  resultMessage: document.querySelector("#result-message"),
  roleHint: document.querySelector("#role-hint"),
  finalBest: document.querySelector("#final-best"),
  restartButton: document.querySelector("#restart-button")
};

function normalizePasscode(value) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

function showScreen(screenName) {
  elements.startScreen.classList.toggle("is-hidden", screenName !== "start");
  elements.gameScreen.classList.toggle("is-hidden", screenName !== "game");
  elements.resultScreen.classList.toggle("is-hidden", screenName !== "result");
}

function beginGame(role) {
  state.role = role;
  state.stageIndex = 0;
  state.nextIndex = 0;
  state.totalConnections = 0;
  state.tracePoints = [cellCenter(stages[0].start)];
  state.player = { ...stages[0].start };
  elements.roleBadge.textContent = role.label;
  showScreen("game");
  render();
}

function currentStage() {
  return stages[state.stageIndex];
}

function cellKey(point) {
  return `${point.x},${point.y}`;
}

function cellCenter(point) {
  return {
    x: point.x + 0.5,
    y: point.y + 0.5
  };
}

function render() {
  const stage = currentStage();
  const pathByCell = new Map(stage.path.map((node, index) => [cellKey(node), { ...node, index }]));
  const trapByCell = new Map(stage.traps.map((trap) => [cellKey(trap), trap]));

  elements.stageNumber.textContent = String(state.stageIndex + 1);
  elements.stageTitle.textContent = stage.title;
  elements.stageDescription.textContent = stage.description;
  elements.nextNode.textContent = stage.path[state.nextIndex]?.label || "목적지";
  elements.connectionCount.textContent = String(state.totalConnections);
  elements.bestCount.textContent = String(state.bestConnections);

  elements.board.innerHTML = "";
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const cell = document.createElement("div");
      const key = `${x},${y}`;
      const pathNode = pathByCell.get(key);
      const trapNode = trapByCell.get(key);
      cell.className = "cell";

      if (x === stage.start.x && y === stage.start.y) {
        cell.classList.add("start-cell");
        cell.textContent = "출발";
      }

      if (pathNode) {
        cell.classList.add("node");
        cell.textContent = pathNode.label;
        if (pathNode.index < state.nextIndex) cell.classList.add("is-done");
        if (pathNode.index === state.nextIndex) cell.classList.add("is-next");
      }

      if (trapNode) {
        cell.classList.add("trap");
        cell.textContent = trapNode.label;
      }

      if (x === state.player.x && y === state.player.y) {
        cell.classList.add("player");
      }

      elements.board.appendChild(cell);
    }
  }

  drawTrace();
}

function drawTrace() {
  elements.traceLayer.setAttribute("viewBox", `0 0 ${BOARD_SIZE} ${BOARD_SIZE}`);
  elements.traceLayer.innerHTML = "";

  if (state.tracePoints.length < 2) return;

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", state.tracePoints.map((point) => `${point.x},${point.y}`).join(" "));
  polyline.setAttribute("vector-effect", "non-scaling-stroke");
  elements.traceLayer.appendChild(polyline);
}

function movePlayer(direction) {
  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const delta = deltas[direction];
  if (!delta || elements.gameScreen.classList.contains("is-hidden")) return;

  const nextPosition = {
    x: state.player.x + delta.x,
    y: state.player.y + delta.y
  };

  if (nextPosition.x < 0 || nextPosition.y < 0 || nextPosition.x >= BOARD_SIZE || nextPosition.y >= BOARD_SIZE) {
    showToast("그리드 밖으로는 이동할 수 없습니다.", false);
    return;
  }

  state.player = nextPosition;
  evaluateCell();
  render();
}

function evaluateCell() {
  const stage = currentStage();
  const playerKey = cellKey(state.player);
  const trap = stage.traps.find((node) => cellKey(node) === playerKey);
  const nextNode = stage.path[state.nextIndex];

  if (trap) {
    resetStage(`오답 노드 '${trap.label}'에 닿았습니다. 현재 스테이지를 다시 시작합니다.`);
    return;
  }

  if (!nextNode || cellKey(nextNode) !== playerKey) return;

  state.nextIndex += 1;
  state.totalConnections += 1;
  state.tracePoints.push(cellCenter(nextNode));
  updateBestConnections();
  showToast(`정답 연결: ${nextNode.label}`, true);

  if (state.nextIndex >= stage.path.length) {
    completeStage();
  }
}

function updateBestConnections() {
  if (state.totalConnections <= state.bestConnections) return;
  state.bestConnections = state.totalConnections;
  localStorage.setItem(STORAGE_KEY, String(state.bestConnections));
}

function resetStage(message) {
  const stage = currentStage();
  state.player = { ...stage.start };
  state.nextIndex = 0;
  state.totalConnections = stages
    .slice(0, state.stageIndex)
    .reduce((sum, item) => sum + item.path.length, 0);
  updateBestConnections();
  rebuildTraceToStageStart();
  showToast(message, false);
}

function rebuildTraceToStageStart() {
  const points = [];
  stages.slice(0, state.stageIndex).forEach((stage) => {
    if (points.length === 0) points.push(cellCenter(stage.start));
    stage.path.forEach((node) => points.push(cellCenter(node)));
  });
  points.push(cellCenter(currentStage().start));
  state.tracePoints = points;
}

function completeStage() {
  if (state.stageIndex === stages.length - 1) {
    setTimeout(showResult, 250);
    return;
  }

  state.stageIndex += 1;
  state.nextIndex = 0;
  state.player = { ...currentStage().start };
  state.tracePoints.push(cellCenter(currentStage().start));
  showToast(`Stage ${state.stageIndex} 클리어! 다음 인과관계로 이동합니다.`, true);
}

function showResult() {
  const role = state.role;
  elements.finalLetter.textContent = role.label;
  elements.resultMessage.textContent = `${role.name} 역할로 3단계 인과관계 ${state.totalConnections}개를 모두 연결했습니다.`;
  elements.roleHint.textContent = role.hint;
  elements.finalBest.textContent = String(state.bestConnections);
  showScreen("result");
}

let toastTimer;
function showToast(message, success) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.style.background = success ? "rgba(63, 143, 93, 0.96)" : "rgba(209, 73, 91, 0.96)";
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 1800);
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const passcode = normalizePasscode(elements.passcodeInput.value);
  const role = roles[passcode];

  if (!role) {
    elements.passcodeError.textContent = "등록되지 않은 패스코드입니다. 테스트 코드를 확인해 주세요.";
    return;
  }

  elements.passcodeError.textContent = "";
  beginGame(role);
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

elements.restartButton.addEventListener("click", () => {
  elements.passcodeInput.value = "";
  showScreen("start");
  elements.passcodeInput.focus();
});

elements.bestCount.textContent = String(state.bestConnections);
elements.finalBest.textContent = String(state.bestConnections);

const BOARD_SIZE = 11;
const STORAGE_KEY = "eco-coop-mvp-save";
const foodWebOrder = ["생산자", "초식곤충", "어류", "양서·파충류", "조류·포유류", "분해자"];
const pyramidOrder = ["생산자 1000", "1차 소비자 100", "2차 소비자 10", "최상위 소비자 1"];

const roleData = {
  "1004": {
    code: "1004",
    roleName: "식물·곤충 전문가",
    badge: "식물·곤충",
    resultLetters: ["교"],
    path: [
      { x: 1, y: 9, label: "가시연 부활" },
      { x: 3, y: 8, label: "연테두리진딧물 증가" },
      { x: 5, y: 6, label: "실잠자리 성충 증가" },
      { x: 7, y: 4, label: "물장군 사냥 활성화" }
    ],
    traps: [
      { x: 2, y: 7, label: "식물 즙액 감소" },
      { x: 6, y: 7, label: "실잠자리 유충 전멸" }
    ],
    hint: "1. 당신이 미로에서 완성한 글자 [ 교 ]는 최종 장소 이름의 '첫 번째 글자'입니다.\n2. [함정 해제 단서]: 조류·포유류 대원의 화면에 글자가 두 개 떠서 혼란을 겪고 있습니다. 조류·포유류 대원에게 '황소개구리(교란종) 경로는 가짜이며, 오직 잉어를 주식으로 삼는 수중생활 포유류(수달)의 정답 경로로 만들어진 글자만 진짜'라고 알려주십시오!"
  },
  "2005": {
    code: "2005",
    roleName: "미생물·어류 전문가",
    badge: "미생물·어류",
    resultLetters: ["무"],
    path: [
      { x: 1, y: 9, label: "돌말류/녹조류 광합성" },
      { x: 3, y: 7, label: "짚신벌레류 증식" },
      { x: 5, y: 5, label: "송사리/큰가시고기 먹이 풍부" },
      { x: 8, y: 3, label: "가물치/메기 평형 조절" }
    ],
    traps: [
      { x: 2, y: 5, label: "메탄가스 흡수 차단" },
      { x: 6, y: 7, label: "짚신벌레 광합성 시작" }
    ],
    hint: "1. 당신이 미로에서 완성한 글자 [ 무 ]는 최종 장소 이름의 '두 번째 글자'입니다.\n2. [사용 방법]: 당신이 찾은 글자 뒤에 조류·포유류 대원이 찾아낸 '진짜 글자'를 결합하십시오."
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
    description: "6대 분류군 카드를 에너지 이동 방향에 맞게 빈 칸으로 끌어 놓으세요."
  },
  {
    title: "STAGE 2 - 인과관계 궤적",
    description: "캐릭터를 움직여 활동지에서 도출한 생태학적 연쇄 반응 노드를 순서대로 밟으세요. 오답 노드에 닿으면 이 스테이지가 리셋됩니다."
  },
  {
    title: "STAGE 3 - 생태 피라미드",
    description: "영양 단계별 에너지 법칙에 맞게 블록을 아래에서 위로 쌓아 올리세요."
  }
];

const state = {
  role: null,
  stageIndex: 0,
  player: { x: 0, y: 10 },
  nextIndex: 0,
  tracePoints: [],
  startTime: 0,
  elapsedSeconds: 0,
  timerId: null,
  foodPlacements: Array(foodWebOrder.length).fill(null),
  pyramidPlacements: []
};

const elements = {
  startScreen: document.querySelector("#start-screen"),
  gameScreen: document.querySelector("#game-screen"),
  resultScreen: document.querySelector("#result-screen"),
  form: document.querySelector("#passcode-form"),
  passcodeInput: document.querySelector("#passcode-input"),
  passcodeError: document.querySelector("#passcode-error"),
  savedSummary: document.querySelector("#saved-summary"),
  stageNumber: document.querySelector("#stage-number"),
  stageTitle: document.querySelector("#stage-title"),
  stageDescription: document.querySelector("#stage-description"),
  nextNodeWrap: document.querySelector("#next-node-wrap"),
  nextNode: document.querySelector("#next-node"),
  roleBadge: document.querySelector("#role-badge"),
  stageStatus: document.querySelector("#stage-status"),
  timer: document.querySelector("#timer"),
  bestTime: document.querySelector("#best-time"),
  stageOne: document.querySelector("#stage-one"),
  stageTwo: document.querySelector("#stage-two"),
  stageThree: document.querySelector("#stage-three"),
  dropLane: document.querySelector("#drop-lane"),
  cardBank: document.querySelector("#card-bank"),
  checkFoodWeb: document.querySelector("#check-food-web"),
  resetFoodWeb: document.querySelector("#reset-food-web"),
  board: document.querySelector("#game-board"),
  traceLayer: document.querySelector("#trace-layer"),
  pyramidStack: document.querySelector("#pyramid-stack"),
  pyramidBank: document.querySelector("#pyramid-bank"),
  resetPyramid: document.querySelector("#reset-pyramid"),
  toast: document.querySelector("#toast"),
  finalLetter: document.querySelector("#final-letter"),
  resultMessage: document.querySelector("#result-message"),
  roleHint: document.querySelector("#role-hint"),
  finalTime: document.querySelector("#final-time"),
  finalBest: document.querySelector("#final-best"),
  restartButton: document.querySelector("#restart-button"),
  copyAnswer: document.querySelector("#copy-answer")
};

function getSave() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { completedRoles: {}, bestTime: null };
  } catch {
    return { completedRoles: {}, bestTime: null };
  }
}

function setSave(save) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  renderSavedSummary();
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "--:--";
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderSavedSummary() {
  const save = getSave();
  const completed = Object.values(save.completedRoles || {}).map((item) => item.badge).join(", ");
  elements.savedSummary.textContent = completed
    ? `클리어 역할: ${completed} · 최고 클리어 타임: ${formatTime(save.bestTime)}`
    : "아직 클리어 기록이 없습니다.";
  elements.bestTime.textContent = formatTime(save.bestTime);
}

function normalizePasscode(value) {
  return value.trim();
}

function showScreen(screenName) {
  elements.startScreen.classList.toggle("is-hidden", screenName !== "start");
  elements.gameScreen.classList.toggle("is-hidden", screenName !== "game");
  elements.resultScreen.classList.toggle("is-hidden", screenName !== "result");
}

function beginGame(role) {
  state.role = role;
  state.stageIndex = 0;
  state.player = { x: 0, y: 10 };
  state.nextIndex = 0;
  state.tracePoints = [cellCenter(state.player)];
  state.foodPlacements = Array(foodWebOrder.length).fill(null);
  state.pyramidPlacements = [];
  state.startTime = Date.now();
  state.elapsedSeconds = 0;
  window.clearInterval(state.timerId);
  state.timerId = window.setInterval(updateTimer, 500);
  elements.roleBadge.textContent = role.badge;
  elements.stageStatus.textContent = "진행 중";
  updateTimer();
  showScreen("game");
  renderStage();
}

function updateTimer() {
  if (!state.startTime) return;
  state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  elements.timer.textContent = formatTime(state.elapsedSeconds);
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

  if (state.stageIndex === 0) renderFoodWeb();
  if (state.stageIndex === 1) renderTraceStage();
  if (state.stageIndex === 2) renderPyramid();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function renderFoodWeb() {
  elements.dropLane.innerHTML = "";
  state.foodPlacements.forEach((label, index) => {
    const slot = document.createElement("button");
    slot.className = "drop-slot";
    slot.type = "button";
    slot.dataset.index = String(index);
    slot.textContent = label || `${index + 1}번째`;
    slot.addEventListener("dragover", allowDrop);
    slot.addEventListener("drop", handleFoodDrop);
    slot.addEventListener("click", () => removeFoodCard(index));
    elements.dropLane.appendChild(slot);

    if (index < foodWebOrder.length - 1) {
      const arrow = document.createElement("span");
      arrow.className = "energy-arrow";
      arrow.textContent = "➜";
      elements.dropLane.appendChild(arrow);
    }
  });

  elements.cardBank.innerHTML = "";
  const remaining = foodWebOrder.filter((label) => !state.foodPlacements.includes(label));
  shuffle(remaining).forEach((label) => {
    const card = document.createElement("button");
    card.className = "food-card";
    card.type = "button";
    card.draggable = true;
    card.textContent = label;
    card.dataset.label = label;
    card.addEventListener("dragstart", handleFoodDrag);
    card.addEventListener("click", () => placeNextEmptyFoodCard(label));
    elements.cardBank.appendChild(card);
  });
}

function handleFoodDrag(event) {
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.label);
}

function allowDrop(event) {
  event.preventDefault();
}

function handleFoodDrop(event) {
  event.preventDefault();
  const label = event.dataTransfer.getData("text/plain");
  const index = Number(event.currentTarget.dataset.index);
  placeFoodCard(label, index);
}

function placeFoodCard(label, index) {
  if (!label || !foodWebOrder.includes(label)) return;
  state.foodPlacements = state.foodPlacements.map((item) => (item === label ? null : item));
  state.foodPlacements[index] = label;
  renderFoodWeb();
}

function placeNextEmptyFoodCard(label) {
  const emptyIndex = state.foodPlacements.findIndex((item) => item === null);
  if (emptyIndex === -1) return;
  placeFoodCard(label, emptyIndex);
}

function removeFoodCard(index) {
  state.foodPlacements[index] = null;
  renderFoodWeb();
}

function checkFoodWeb() {
  const isCorrect = foodWebOrder.every((label, index) => state.foodPlacements[index] === label);
  if (!isCorrect) {
    showToast("에너지 이동 방향이 맞지 않습니다. 생산자에서 시작해 분해자로 순환시켜 보세요.", false);
    return;
  }
  showToast("먹이그물 연결 성공! 인과관계 궤적으로 이동합니다.", true);
  goToStage(1);
}

function resetFoodWeb() {
  state.foodPlacements = Array(foodWebOrder.length).fill(null);
  renderFoodWeb();
}

function goToStage(stageIndex) {
  state.stageIndex = stageIndex;
  state.nextIndex = 0;
  if (stageIndex === 1) {
    state.player = { x: 0, y: 10 };
    state.tracePoints = [cellCenter(state.player)];
  }
  renderStage();
}

function cellKey(point) {
  return `${point.x},${point.y}`;
}

function cellCenter(point) {
  return { x: point.x + 0.5, y: point.y + 0.5 };
}

function renderTraceStage() {
  const role = state.role;
  const pathByCell = new Map(role.path.map((node, index) => [cellKey(node), { ...node, index, kind: "node" }]));
  const trapByCell = new Map(role.traps.map((trap) => [cellKey(trap), { ...trap, kind: "trap" }]));
  const fakeByCell = new Map((role.fakePath || []).map((node, index) => [cellKey(node), { ...node, index, kind: "fake" }]));

  elements.nextNode.textContent = role.path[state.nextIndex]?.label || "생태 피라미드";
  elements.board.innerHTML = "";

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const key = `${x},${y}`;
      const pathNode = pathByCell.get(key);
      const fakeNode = fakeByCell.get(key);
      const trapNode = trapByCell.get(key);
      const cell = document.createElement("div");
      cell.className = "cell";

      if (x === 0 && y === 10) {
        cell.classList.add("start-cell");
        cell.textContent = "출발";
      }

      if (pathNode) {
        cell.classList.add("node");
        cell.textContent = pathNode.label;
        if (pathNode.index < state.nextIndex) cell.classList.add("is-done");
        if (pathNode.index === state.nextIndex) cell.classList.add("is-next");
      }

      if (fakeNode) {
        cell.classList.add("fake-node");
        cell.textContent = fakeNode.label;
      }

      if (trapNode) {
        cell.classList.add("trap");
        cell.textContent = trapNode.label;
      }

      if (x === state.player.x && y === state.player.y) cell.classList.add("player");
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
  if (state.stageIndex !== 1) return;
  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const delta = deltas[direction];
  if (!delta) return;

  const nextPosition = { x: state.player.x + delta.x, y: state.player.y + delta.y };
  if (nextPosition.x < 0 || nextPosition.y < 0 || nextPosition.x >= BOARD_SIZE || nextPosition.y >= BOARD_SIZE) {
    showToast("그리드 밖으로는 이동할 수 없습니다.", false);
    return;
  }

  state.player = nextPosition;
  evaluateTraceCell();
  renderTraceStage();
}

function evaluateTraceCell() {
  const role = state.role;
  const playerKey = cellKey(state.player);
  const wrongNode = [...role.traps, ...(role.fakePath || [])].find((node) => cellKey(node) === playerKey);
  const nextNode = role.path[state.nextIndex];

  if (wrongNode) {
    resetTraceStage(`오답·교란 노드 '${wrongNode.label}'에 닿았습니다. STAGE 2를 출발점에서 다시 시작합니다.`);
    return;
  }

  if (!nextNode || cellKey(nextNode) !== playerKey) return;
  state.nextIndex += 1;
  state.tracePoints.push(cellCenter(nextNode));
  showToast(`정답 인과관계 확인: ${nextNode.label}`, true);

  if (state.nextIndex >= role.path.length) {
    window.setTimeout(() => {
      showToast("인과관계 궤적 완성! 생태 피라미드로 이동합니다.", true);
      goToStage(2);
    }, 250);
  }
}

function resetTraceStage(message) {
  state.player = { x: 0, y: 10 };
  state.nextIndex = 0;
  state.tracePoints = [cellCenter(state.player)];
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
  window.clearInterval(state.timerId);
  updateTimer();
  const save = getSave();
  const role = state.role;
  save.completedRoles = save.completedRoles || {};
  save.completedRoles[role.code] = {
    badge: role.badge,
    completedAt: new Date().toISOString(),
    time: state.elapsedSeconds
  };
  if (!save.bestTime || state.elapsedSeconds < save.bestTime) save.bestTime = state.elapsedSeconds;
  setSave(save);

  elements.finalLetter.textContent = role.resultLetters.join(" / ");
  elements.resultMessage.textContent = `${role.roleName} 세션으로 3개 스테이지를 모두 완수했습니다. 조원과 글자 및 함정 해제 단서를 조합해 최종 장소를 도출하세요.`;
  elements.roleHint.textContent = role.hint;
  elements.finalTime.textContent = formatTime(state.elapsedSeconds);
  elements.finalBest.textContent = formatTime(save.bestTime);
  showScreen("result");
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
  const role = roleData[normalizePasscode(elements.passcodeInput.value)];
  if (!role) {
    elements.passcodeError.textContent = "등록되지 않은 패스코드입니다. 1004, 2005, 3006 중 하나를 입력하세요.";
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

elements.checkFoodWeb.addEventListener("click", checkFoodWeb);
elements.resetFoodWeb.addEventListener("click", resetFoodWeb);
elements.resetPyramid.addEventListener("click", resetPyramid);
elements.restartButton.addEventListener("click", () => {
  window.clearInterval(state.timerId);
  elements.passcodeInput.value = "";
  showScreen("start");
  renderSavedSummary();
  elements.passcodeInput.focus();
});
elements.copyAnswer.addEventListener("click", () => showToast("정답 장소는 '교무실'입니다. 단, 조원끼리 근거를 설명해야 최종 해제 성공!", true));

renderSavedSummary();

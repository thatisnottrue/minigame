# STAGE 2 GROW 배경 이미지

관리자가 제작한 STAGE 2 GROW 게임 전용 배경 이미지를 이 폴더에 업로드하면 코드 변경 없이 자동으로 적용됩니다.

## 파일명 규칙

- `bg_turn_0.png` 또는 `bg_turn_0.jpg` — 초기 흙바닥
- `bg_turn_1.png` 또는 `bg_turn_1.jpg` — 1단계 (미생물)
- `bg_turn_2.png` 또는 `bg_turn_2.jpg` — 2단계 (식물)
- `bg_turn_3.png` 또는 `bg_turn_3.jpg` — 3단계 (수서곤충)
- `bg_turn_4.png` 또는 `bg_turn_4.jpg` — 4단계 (어류)
- `bg_turn_5.png` 또는 `bg_turn_5.jpg` — 5단계 (조류)
- `bg_turn_6.png` 또는 `bg_turn_6.jpg` — 6단계 (포유류/성공)
- `bg_turn_error.png` 또는 `bg_turn_error.jpg` — 오답 (배드 엔딩)

`.png`가 우선 적용되며, 없으면 `.jpg`를 시도합니다. 둘 다 없으면 게임 내 CSS 그라데이션 폴백 배경이 표시됩니다.

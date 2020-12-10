import consoleCube from '../helper/RubiksCubeConsoleOutput.js';

// ---------------------------- init ----------------------------
// 파일을 읽을 때 input 박스에 이벤트를 건다.
function init() {
  window.rubiksCube = {
    up: makeOneSideCube('W'),
    left: makeOneSideCube('G'),
    front: makeOneSideCube('R'),
    right: makeOneSideCube('B'),
    back: makeOneSideCube('O'),
    down: makeOneSideCube('Y'),
  };

  const inputValue = document.querySelector('#inputValue');
  inputValue.addEventListener('keypress', pressEnter);
  makeDom('#initialCube', 'div', 'cube', cubeToString());
  shuffleEvent();
}

// 입력 받은 색깔로 2차원 배열 생성
function makeOneSideCube(color) {
  return [
    [color, color, color],
    [color, color, color],
    [color, color, color],
  ];
}

// enter 클릭 시 입력값에 대한 유효성검사 함수 실행.
function pressEnter(e) {
  if (e.keyCode === 13) {
    validateInputValue(e.target.value);
    e.target.value = '';
  }
}

// ---------------------------- 유효성 검사 ----------------------------
// 입력값에 대한 유효성 검사
function validateInputValue(value) {
  if (!validateChar(value[0])) {
    alert('올바른 값을 입력해 주세요.1');
    return;
  }

  for (let i = 0; i < value.length; i++) {
    if (!validateChar(value[i]) && value[i] !== "'" && Number(value[i]) !== 2) {
      alert('올바른 값을 입력해 주세요.2');
      return;
    } else if (value[i] === "'" && (!validateChar(value[i - 1]) || Number(value[i + 1]))) {
      alert('올바른 값을 입력해 주세요.3');
      return;
    } else if (Number(value[i]) === 2 && !validateChar(value[i - 1])) {
      alert('올바른 값을 입력해 주세요.4');
      return;
    }
  }

  pushRubiksCube(recombinantString(value));
}

// 알파벳에 대한 유효성 검사
function validateChar(char) {
  char = char.toUpperCase();
  return (
    char === 'U' ||
    char === 'L' ||
    char === 'F' ||
    char === 'R' ||
    char === 'B' ||
    char === 'D' ||
    char === 'Q'
  );
}

// 입력 받은 문자열 재조합
function recombinantString(value) {
  return value.split('').reduce((acc, cur) => {
    if (cur === "'" || Number(cur)) {
      acc[acc.length - 1] += cur;
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);
}

// ---------------------------- 큐브 밀기 ----------------------------
// 입력받은 명령에 따라 루빅스 큐브 밀기 밀기
function pushRubiksCube(value) {
  for (let i = 0; i < value.length; i++) {
    if (value[i].toUpperCase() === 'Q') {
      // deleteEvent();
    } else if (Number(value[i][1]) === 2) {
      turnCube(value[i]);
    }

    if (value[i].toUpperCase() !== 'Q') {
      turnCube(value[i]);
    }
    showResult(value[i].toUpperCase());
    // setTimeout(() => showResult(char), 500 * i);
  }
}

// 입력받은 면과 주위 면을 변경
function turnCube(char) {
  let charUpperCase = char[0].toUpperCase();
  let oneSide = rubiksCube[convertChar(charUpperCase)];

  if (char.length === 1) {
    rubiksCube[convertChar(charUpperCase)] = turnClock(oneSide);
  } else {
    rubiksCube[convertChar(charUpperCase)] = turnCounterClock(oneSide);
  }

  moveSide(char);
}

// 입력받은 문자를 문자열로 변경
function convertChar(char) {
  let result;

  if (char === 'U') {
    result = 'up';
  } else if (char === 'L') {
    result = 'left';
  } else if (char === 'F') {
    result = 'front';
  } else if (char === 'R') {
    result = 'right';
  } else if (char === 'B') {
    result = 'back';
  } else if (char === 'D') {
    result = 'down';
  }

  return result;
}

// 입력받은 면을 시계 방향으로 회전
function turnClock(side) {
  let copySide = [[], [], []];

  for (let i = 0; i < side.length; i++) {
    for (let j = 0; j < side[i].length; j++) {
      copySide[j][2 - i] = side[i][j];
    }
  }

  return copySide;
}

// 입력받은 면을 반시계 방향으로 회전
function turnCounterClock(side) {
  let copySide = [[], [], []];

  for (let i = 0; i < side.length; i++) {
    for (let j = 0; j < side[i].length; j++) {
      copySide[2 - j][i] = side[i][j];
    }
  }

  return copySide;
}

// 입력받은 면의 주위 면들을 변경
function moveSide(char) {
  let charUpperCase = char[0].toUpperCase();
  let copyCube = JSON.parse(JSON.stringify(rubiksCube));

  if (charUpperCase === 'U' || charUpperCase === 'D') {
    moveUpDown(char, copyCube);
  } else if (charUpperCase === 'L' || charUpperCase === 'R') {
    moveLeftRight(char, copyCube);
  } else if (charUpperCase === 'F' || charUpperCase === 'B') {
    moveFrontBack(char, copyCube);
  }
}

// up, down
// up, down 면이 입력 될 시 left, right, front, back 면 변경
function moveUpDown(char, cube) {
  let idx = char[0].toUpperCase() === 'U' ? 0 : 2;
  let order = ['left', 'front', 'right', 'back'];

  if (
    (char[0].toUpperCase() === 'U' && char[1] === "'") ||
    (char[0].toUpperCase() === 'D' && char[1] !== "'")
  ) {
    order = order.reverse();
  }

  for (let i = 0; i < order.length; i++) {
    rubiksCube[order[i]][idx] = cube[order[(i + 1) % 4]][idx];
  }
}

// left, right
// left, right 면이 입력 될 시 front, back, up, down 면 병경
function moveLeftRight(char, cube) {
  let idx = [0, 2];
  let order = leftRightOderHelper(char);

  if (char[0].toUpperCase() === 'R') {
    idx[0] = 2;
    idx[1] = 0;
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      moveLeftRightHelper(idx, order, cube, i, j);
    }
  }
}

// left, right
// left, right 면이 입력 될 시 order를 재조합 해줌
function leftRightOderHelper(char) {
  let order = ['down', 'front', 'up', 'back'];
  let side;

  if (
    (char[0].toUpperCase() === 'R' && char[1] !== "'") ||
    (char[0].toUpperCase() === 'L' && char[1] === "'")
  ) {
    side = order.pop();
    order = order.reverse();
    order.push(side);
  }

  return order;
}

// left, right
// left, right 면이 입력 될 시 실질적으로 적용
function moveLeftRightHelper(index, order, cube, i, j) {
  let idx = index.slice();
  if (i === 0 || i === 1) {
    rubiksCube[order[i]][j][idx[0]] = cube[order[(i + 1) % 4]][j][idx[0]];
  } else {
    if (i === 3) {
      idx = idx.reverse();
    }
    rubiksCube[order[i]][j][idx[0]] = cube[order[(i + 1) % 4]][Math.abs(j - 2)][idx[1]];
  }
}

// front, back
// front, back 면이 입력 될 시 up, down, left, right 면 변경
function moveFrontBack(char, cube) {
  let idx = [0, 2];
  let apostrophe = false;
  let order = frontBackOderHelper(char);

  if (
    (char[0].toUpperCase() === 'F' && char[1] === "'") ||
    (char[0].toUpperCase() === 'B' && char[1] !== "'")
  ) {
    apostrophe = true;
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      moveFrontBackHelper(idx, order, cube, i, j, apostrophe);
    }
  }
}

// front, back
// front, back 면이 입력 될 시 order 재조합
function frontBackOderHelper(char) {
  let order;

  if (char[0].toUpperCase() === 'F' && char[1] !== "'") {
    order = ['up', 'left', 'down', 'right'];
  } else if (char[0].toUpperCase() === 'F' && char[1] === "'") {
    order = ['left', 'up', 'right', 'down'];
  } else if (char[0].toUpperCase() === 'B' && char[1] !== "'") {
    order = ['right', 'down', 'left', 'up'];
  } else if (char[0].toUpperCase() === 'B' && char[1] === "'") {
    order = ['down', 'right', 'up', 'left'];
  }

  return order;
}

// front, back
// front, back 면이 입력 될 시 실질적으로 적용
function moveFrontBackHelper(index, order, cube, i, j, apostrophe) {
  let idx = index.slice();

  if (i === 2 || i === 3) {
    idx = idx.reverse();
  }

  if (i === 0 || i === 2) {
    if (!apostrophe) {
      rubiksCube[order[i]][idx[1]][j] = cube[order[(i + 1) % 4]][Math.abs(j - 2)][idx[1]];
    } else {
      rubiksCube[order[i]][Math.abs(j - 2)][idx[1]] = cube[order[(i + 1) % 4]][idx[1]][j];
    }
  } else if (i === 1 || i === 3) {
    if (!apostrophe) {
      rubiksCube[order[i]][j][idx[1]] = cube[order[(i + 1) % 4]][idx[0]][j];
    } else {
      rubiksCube[order[i]][idx[1]][j] = cube[order[(i + 1) % 4]][j][idx[0]];
    }
  }
}

// ---------------------------- dom 결과 조작 ----------------------------
// 만들어진 루빅스 큐브를 웹에 보여줌
function showResult(char) {
  let result;
  if (char === 'Q') {
    result = '경과시간 조작갯수 감사합니다.';
  } else {
    result = char + cubeToString();
  }

  makeDom('#outputValue', 'li', 'result', result);
}

// 루빅스 큐브를 웹에 보여주기 위해 문자열로 변경
function cubeToString() {
  return `
    <br> ${blankOutput(10)} ${lineToString('up', 0)} 
    <br> ${blankOutput(10)} ${lineToString('up', 1)} 
    <br> ${blankOutput(10)} ${lineToString('up', 2)} 
    <br> 
    <br> ${lineToString('left', 0)} &nbsp ${lineToString('front', 0)} &nbsp 
         ${lineToString('right', 0)} &nbsp ${lineToString('back', 0)} 
    <br> ${lineToString('left', 1)} &nbsp ${lineToString('front', 1)} &nbsp 
         ${lineToString('right', 1)} &nbsp ${lineToString('back', 1)} 
    <br> ${lineToString('left', 2)} &nbsp ${lineToString('front', 2)} &nbsp 
         ${lineToString('right', 2)} &nbsp ${lineToString('back', 2)} 
    <br>     
    <br> ${blankOutput(11)} ${lineToString('down', 0)} 
    <br> ${blankOutput(11)} ${lineToString('down', 1)} 
    <br> ${blankOutput(11)} ${lineToString('down', 2)} 
  `;
}

// 입력받은 면과 index 값으로 문자를 재조합 후 반환
function lineToString(side, num) {
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += rubiksCube[side][num][i] + '  ';
  }
  return result;
}

// 입력받은 숫자만큼 공백을 만들어 줌
function blankOutput(num) {
  let blank = '';
  for (let i = 0; i < num; i++) {
    blank += '&nbsp';
  }
  return blank;
}

// 타겟태그, 만들태그, 만들클래스이름, 넣을내용 입력 시 첫번째 자식노드로 삽입
function makeDom(targetId, tag, className, result) {
  const target = document.querySelector(targetId);
  const newResult = document.createElement(tag);
  newResult.classList.add(className);
  newResult.innerHTML = result;
  target.insertBefore(newResult, target.firstChild);
}

// ---------------------------- 섞기 ----------------------------
// 섞기 이벤트와 랜덤 섞기 이벤트 걸기
function shuffleEvent() {
  const button = document.querySelector('#shuffleButton');
  const randomButton = document.querySelector('#randomShuffleButton');
  button.addEventListener('click', clickShuffleButton);
  randomButton.addEventListener('click', clickRandomShuffleButton);
}

// 숫자를 입력 받은 횟수 만큼 섞기
function clickShuffleButton() {
  const count = document.querySelector('#count');
  if (0 < Number(count.value) && Number(count.value) < 100) {
    shuffleCube(Number(count.value));
    changeInitialCube();
  } else {
    alert('1부터 99까지의 숫자 중 하나를 입력해 주세요.');
  }

  count.value = '';
}

// 랜덤섞기 클릭 시 랜덤으로 20번 섞임
function clickRandomShuffleButton() {
  shuffleCube(20);
  changeInitialCube();
}

// shuffleButton버튼 클릭 시 초기상태 변경
function changeInitialCube() {
  const target = document.querySelector('.cube');
  target.remove();
  makeDom('#initialCube', 'div', 'cube', cubeToString());
}

// 입력받은 숫자만큼 랜덤 섞기
function shuffleCube(num) {
  let cmd = ['u', 'l', 'f', 'r', 'b', 'd'];

  for (let i = 0; i < num; i++) {
    let randomNum = Math.floor(Math.random() * 6);
    turnCube(cmd[randomNum]);
  }
}

init();
// turnCube('f');

// q 입력 시 구현
// dom 구현
// 경과 시간 구현
// 총 조작 갯수 구현
// 셔플 기능
// 맞출 시 축하 안내
// 공백 엔터 처리

// if (char === 'U') {
//   rubiksCube.left[0] = copyCube.front[0];
//   rubiksCube.front[0] = copyCube.right[0];
//   rubiksCube.right[0] = copyCube.back[0];
//   rubiksCube.back[0] = copyCube.left[0];
// } else if (char === 'L') {
//   rubiksCube.up[0][0] = copyCube.back[2][2];
//   rubiksCube.up[1][0] = copyCube.back[1][2];
//   rubiksCube.up[2][0] = copyCube.back[0][2];

//   rubiksCube.back[0][2] = copyCube.down[2][0];
//   rubiksCube.back[1][2] = copyCube.down[1][0];
//   rubiksCube.back[2][2] = copyCube.down[0][0];

//   rubiksCube.down[0][0] = copyCube.front[0][0];
//   rubiksCube.down[1][0] = copyCube.front[1][0];
//   rubiksCube.down[2][0] = copyCube.front[2][0];

//   rubiksCube.front[0][0] = copyCube.up[0][0];
//   rubiksCube.front[1][0] = copyCube.up[1][0];
//   rubiksCube.front[2][0] = copyCube.up[2][0];
// } else if (char === 'F') {
//   rubiksCube.up[2][0] = copyCube.left[2][2];
//   rubiksCube.up[2][1] = copyCube.left[1][2];
//   rubiksCube.up[2][2] = copyCube.left[0][2];

//   rubiksCube.right[0][0] = copyCube.up[2][0];
//   rubiksCube.right[1][0] = copyCube.up[2][1];
//   rubiksCube.right[2][0] = copyCube.up[2][2];

//   rubiksCube.down[0][0] = copyCube.right[2][0];
//   rubiksCube.down[0][1] = copyCube.right[1][0];
//   rubiksCube.down[0][2] = copyCube.right[0][0];

//   rubiksCube.left[0][2] = copyCube.down[0][0];
//   rubiksCube.left[1][2] = copyCube.down[0][1];
//   rubiksCube.left[2][2] = copyCube.down[0][2];
// } else if (char === 'R') {
//   rubiksCube.up[0][2] = copyCube.front[0][2];
//   rubiksCube.up[1][2] = copyCube.front[1][2];
//   rubiksCube.up[2][2] = copyCube.front[2][2];

//   rubiksCube.front[0][2] = copyCube.down[0][2];
//   rubiksCube.front[1][2] = copyCube.down[1][2];
//   rubiksCube.front[2][2] = copyCube.down[2][2];

//   rubiksCube.down[0][2] = copyCube.back[2][0];
//   rubiksCube.down[1][2] = copyCube.back[1][0];
//   rubiksCube.down[2][2] = copyCube.back[0][0];

//   rubiksCube.back[0][0] = copyCube.up[2][2];
//   rubiksCube.back[1][0] = copyCube.up[1][2];
//   rubiksCube.back[2][0] = copyCube.up[0][2];
// } else if (char === 'B') {
//   rubiksCube.up[0][0] = copyCube.right[0][2];
//   rubiksCube.up[0][1] = copyCube.right[1][2];
//   rubiksCube.up[0][2] = copyCube.right[2][2];

//   rubiksCube.right[0][2] = copyCube.down[2][2];
//   rubiksCube.right[1][2] = copyCube.down[2][1];
//   rubiksCube.right[2][2] = copyCube.down[2][0];

//   rubiksCube.down[2][0] = copyCube.left[0][0];
//   rubiksCube.down[2][1] = copyCube.left[1][0];
//   rubiksCube.down[2][2] = copyCube.left[2][0];

//   rubiksCube.left[0][0] = copyCube.up[0][2];
//   rubiksCube.left[1][0] = copyCube.up[0][1];
//   rubiksCube.left[2][0] = copyCube.up[0][0];
// } else if (char === 'D') {
//   rubiksCube.left[2] = copyCube.back[2];
//   rubiksCube.front[2] = copyCube.left[2];
//   rubiksCube.right[2] = copyCube.front[2];
//   rubiksCube.back[2] = copyCube.right[2];
// }
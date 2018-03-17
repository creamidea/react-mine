import _ from 'lodash';

const FLAG = {
  M: 'M', // Unrevealed Mine
  E: 'E', // Unrevealed Empty Square
  B: 'B', // Revealed Blank Square
  X: 'X', // Revealed Mine
};

export default class MineField {
  constructor(mode) {
    this.mode = mode || 'easy';
    this.data = []; // 雷区
    this.mines = []; // 雷

    this.init();
  }

  /**
   * 初始化雷区
   */
  init() {
    let column = 0;
    let row = 0;
    let mineNumber = 0;

    switch (this.mode) {
      case 'easy':
        column = 10;
        row = 10;
        mineNumber = 10;
        break;

      default:
        throw new Error('未知模式');
    }

    this.initField(row, column);
    this.initMines(mineNumber);
  }

  /**
   * 初始化雷区
   */
  initField(row, column) {
    const data = _.map(_.repeat(FLAG.E, row), () => _.split(_.repeat(FLAG.E, column), ''));
    this.data = data;
  }

  /**
   * 初始化雷位置
   */
  initMines(number) {
    let counter = number;
    const { data } = this;
    const row = data.length;
    const column = data[0].length;
    const mines = {};

    while (counter) {
      const x = _.random(0, row - 1);
      const y = _.random(0, column - 1);
      if (!_.get(mines, [x, y])) {
        if (typeof mines[x] === 'undefined') {
          mines[x] = {};
        }
        mines[x][y] = true;
        counter -= 1;
      }
    }

    this.mines = _.flatten(_.map(mines, (items, x) => _.map(items, (v, y) => [x, y])));

    // 布雷
    _.each(this.mines, (mine) => {
      data[mine[0]][mine[1]] = FLAG.M;
    });
    this.data = data;
  }

  isInRange(x, y) {
    const { data } = this;
    return x < data.length && y < data[0].length;
  }

  /**
   * 踩到雷区 [x, y]
   */
  step(position) {
    const { data } = this;
    console.log(data, position);
  }
}

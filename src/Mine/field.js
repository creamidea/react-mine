import _ from 'lodash';
import policy from './policy';
import {
  FIELD_FLAG as FLAG,
  GAME_LEVEL,
} from './constant';


export default class MineField {
  constructor(mode) {
    if (!_.find(_.values(GAME_LEVEL), item => item === mode)) {
      throw new Error('未知游戏模式');
    }

    this.mode = mode;
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
      case GAME_LEVEL.EASY:
      default:
        column = 10;
        row = 10;
        mineNumber = 10;
        break;
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
    this.mineNumber = number;
  }

  /**
   * 判断是否在雷区里面
   */
  isInRange([x, y]) {
    const { data } = this;
    return x >= 0 && x < data.length && y >= 0 && y < data[0].length;
  }

  /**
   * 踩到雷区 [x, y]
   */
  step(position) {
    return policy(this, position);
  }

  /**
   * 标记地雷
   * @param {} param0
   */
  flag([x, y]) {
    const { data } = this;
    if (this.isInRange([x, y])) {
      data[x][y] = FLAG.F;
    }
  }
}

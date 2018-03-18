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
    this.init(mode);
  }

  /**
   * 初始化雷区
   */
  init(mode) {
    let column = 0;
    let row = 0;
    let mineNumber = 0;

    switch (mode) {
      case GAME_LEVEL.EASY:
      default:
        column = 5;
        row = 5;
        mineNumber = 1;
        break;
    }

    this.mode = mode;
    this.data = []; // 雷区
    this.mines = {}; // 雷，方便后续快速判断

    this.initField(row, column);
    this.initMines(mineNumber);
  }

  /**
   * 初始化雷区
   */
  initField(row, column) {
    const data = _.map(_.repeat(FLAG.E, row), () => _.map(_.repeat(FLAG.E, column), value => ({
      value,
      flag: false,
    })));
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

    // 将 map 结构转成 array 结构
    const aMines = _.flatten(_.map(mines, (items, x) => _.map(items, (v, y) => [x, y])));
    // 布雷
    _.each(aMines, (mine) => {
      data[mine[0]][mine[1]].value = FLAG.M;
    });

    this.data = data;
    this.mines = mines;
    this.mineNumber = number;
    this.reminderMineNumber = number;
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
   * @return {boolean} true: 踩中 false: 未踩中
   */
  step(position) {
    return policy(this, position);
  }


  /**
   * 判断有没有标记
   */
  isFlag([x, y]) {
    return this.isInRange([x, y]) && this.data[x][y].flag;
  }

  /**
   * 标记地雷
   * @param {} param0
   */
  flag([x, y]) {
    const { data, mines } = this;
    if (this.isInRange([x, y])) {
      if (_.get(mines, [x, y])) this.reminderMineNumber -= 1;
      data[x][y].flag = true;
    }
  }

  /**
   * 重置块为探索状态
   */
  clear([x, y]) {
    if (this.isInRange([x, y])) {
      this.data[x][y].flag = false;
    }
  }
}

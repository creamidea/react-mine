import React, { Component } from 'react';
import _ from 'lodash';
import MineField from './field';
import {
  FIELD_FLAG as FLAG,
  GAME_LEVEL,
  GAME_STATUS,
} from './constant';

import './index.css';

function createField(mode) {
  const fieldInst = new MineField(mode);
  return fieldInst;
}

function initState({ mode, field }) {
  return {
    mode,
    time: 0, // 游戏时间
    status: GAME_STATUS.READY,
    field,
    flags: [], // 标记情况
  };
}

export default class Mine extends Component {
  constructor() {
    super();
    const mode = GAME_LEVEL.EASY;
    const fieldInst = createField(mode);
    this.state = initState({ mode, field: fieldInst.data });
    this.fieldInst = fieldInst;
  }

  shouldComponentUpdate() {
    const { status } = this.state;
    return status !== GAME_STATUS.OVER || status !== GAME_STATUS.PAUSE;
  }

  onReset() {
    const { mode } = this.state;
    const fieldInst = createField(mode);

    this.setState(initState({ mode, field: fieldInst.data }));
    this.fieldInst = fieldInst;
  }

  onChange(mode) {
    this.setState({
      mode,
    });
  }

  onClick(e, [x, y]) {
    const { status } = this.state;
    const bombing = this.fieldInst.step([x, y]);

    if (status === GAME_STATUS.RUNNING) {
      this.updateField(bombing);
    } else if (status === GAME_STATUS.READY) {
      this.updateGameStatus(GAME_STATUS.RUNNING).then(() => {
        this.countTimer();
        this.updateField(bombing);
      });
    }
  }

  onRightClick(e, [x, y]) {
    e.preventDefault();
    const { fieldInst } = this;

    if (fieldInst.isFlag([x, y])) {
      fieldInst.clear([x, y]);
    } else {
      fieldInst.flag([x, y]);
    }

    this.updateField();
  }

  countTimer() {
    const { status, time } = this.state;

    if (status === GAME_STATUS.RUNNING) {
      setTimeout(() => {
        this.setState({
          time: time + 1,
        }, () => {
          this.countTimer();
        });
      }, 1000);
    }
  }

  updateField(bombing = false) {
    // 更新雷区情况
    return new Promise((resolve) => {
      this.setState({
        field: this.fieldInst.data,
      }, (pre, now) => {
        this.judge(bombing).then(() => resolve(pre, now));
      });
    });
  }

  updateGameStatus(status) {
    return new Promise((resolve) => {
      this.setState({
        status,
      }, resolve);
    });
  }

  judge(bombing) {
    if (bombing) {
      return this.updateGameStatus(GAME_STATUS.OVER);
    }
    const { fieldInst } = this;
    if (fieldInst.reminderMineNumber === 0 &&
      !_.find(fieldInst.data, items => _.find(items, item => item.value === FLAG.E))) {
      return this.updateGameStatus(GAME_STATUS.OVER);
    }

    return Promise.resolve();
  }

  renderOne([x, y], item) {
    let className;

    if (item.flag) className = 'c-box c-flag';
    else if (_.some([FLAG.E, FLAG.M], flag => flag === item.value)) {
      className = 'c-box c-unexplored';
    } else if (item.value === FLAG.B) className = 'c-box c-block';
    else if (item.value === FLAG.X) className = 'c-box c-bloomed';
    else className = `c-box c-number-${item.value}`;

    return (
      <button
        className={className}
        key={`${x}-${y}`}
        onContextMenu={e => this.onRightClick(e, [x, y])}
        onClick={e => this.onClick(e, [x, y])}
      />);
  }

  renderField() {
    const { field } = this.state;
    return _.map(field, (col, x) => (
      <div key={x}>{_.map(col, (item, y) =>
        this.renderOne([x, y], item))}
      </div>));
  }

  render() {
    const {
      time, status, mode,
    } = this.state;
    const { fieldInst } = this;
    return (
      <div>
        <div className="test" />
        <select
          value={mode}
          onChange={e => this.onChange(e.target.value)}
        >{_.map(_.values(GAME_LEVEL), level => (
          <option key={level} value={level} >{level}</option>))}
        </select>

        <div>
          <div>
            {fieldInst.reminderMineNumber}
          </div>
          {status === GAME_STATUS.OVER && (
          <div>
            <p>GAME OVER!</p>
            <button onClick={() => this.onReset()}>Reset</button>
          </div>
        )}
          <p>{time}</p>
        </div>

        <div>
          {this.renderField()}
        </div>
      </div>);
  }
}

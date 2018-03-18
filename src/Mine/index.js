import React, { Component } from 'react';
import _ from 'lodash';
import MineField from './field';
import {
  FIELD_FLAG as FLAG,
  GAME_LEVEL,
  GAME_STATUS,
  GAME_RESULT,
  MAX_GAME_TIME,
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
    result: null, // 游戏结果
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
    }, () => {
      this.onReset();
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
          if (this.state.time > MAX_GAME_TIME) {
            this.updateGameStatus(GAME_STATUS.OVER)
              .then(() => this.updateGameResult(GAME_RESULT.FAILURE));
          } else {
            this.countTimer();
          }
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
  updateGameResult(result) {
    return new Promise((resolve) => {
      this.setState({
        result,
      }, resolve);
    });
  }

  judge(bombing) {
    if (bombing) {
      return this.updateGameStatus(GAME_STATUS.OVER)
        .then(() => this.updateGameResult(GAME_RESULT.FAILURE));
    }
    const { fieldInst } = this;
    if (fieldInst.reminderMineNumber === 0) {
      return this.updateGameStatus(GAME_STATUS.OVER)
        .then(() => this.updateGameResult(GAME_RESULT.SUCCESS));
    }

    return Promise.resolve();
  }

  renderOne([x, y], item) {
    const { result } = this.state;
    let className;

    if (item.flag) className = 'c-box c-flag';
    else if (item.value === FLAG.E) {
      className = 'c-box c-unexplored';
    } else if (item.value === FLAG.M) {
      className = result === GAME_RESULT.SUCCESS ? 'c-box c-mine' : 'c-box c-unexplored';
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

  renderSmile() {
    const { status, result } = this.state;
    if (status === GAME_STATUS.OVER) {
      if (result === GAME_RESULT.FAILURE) {
        return <img alt="lose" src="/img/lose.png" />;
      }
      return <img alt="win" src="/img/win.png" />;
    }
    return <img alt="ready" src="/img/ready.png" />;
  }

  render() {
    const {
      time, mode,
    } = this.state;
    const { fieldInst } = this;
    return (
      <div>
        <select
          style={{ marginTop: '20px', fontSize: '2em' }}
          value={mode}
          onChange={e => this.onChange(e.target.value)}
        >{_.map(_.values(GAME_LEVEL), level => (
          <option key={level} value={level} >{level}</option>))}
        </select>

        <div className="pannel">
          <div className="c-board">{fieldInst.reminderMineNumber}</div>
          <div>
            <button className="c-btn-reset" onClick={() => this.onReset()}>
              {this.renderSmile()}
            </button>
          </div>
          <div className="c-board">{time}</div>
        </div>

        <div>
          {this.renderField()}
        </div>
      </div>);
  }
}

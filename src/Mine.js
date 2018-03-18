import React, { Component } from 'react';
import _ from 'lodash';
import MineField from './mine-field';
import FLAG from './mine-flag';

const GAME_STATUS = {
  READY: 'ready',
  RUNNING: 'running',
  PAUSE: 'pause',
  OVER: 'game over',
};

const GAME_LEVEL = {
  EASY: 'easy',
  MIDDLE: 'middle',
  HARD: 'hard',
};

function createField(mode) {
  const fieldInst = new MineField(mode);
  return fieldInst;
}

export default class Mine extends Component {
  constructor() {
    super();
    const mode = GAME_LEVEL.EASY;
    const fieldInst = createField(mode);
    this.state = {
      mode,
      time: 0, // 游戏时间
      status: GAME_STATUS.READY,
      field: fieldInst.data,
    };
    this.fieldInst = fieldInst;
  }

  shouldComponentUpdate() {
    const { status } = this.state;
    return status !== GAME_STATUS.OVER || status !== GAME_STATUS.PAUSE;
  }

  onReset() {
    const mode = GAME_LEVEL.EASY;
    const fieldInst = createField(mode);
    this.setState({
      mode,
      time: 0, // 游戏时间
      status: GAME_STATUS.READY,
      field: fieldInst.data,
    });
    this.fieldInst = fieldInst;
  }

  onClick(x, y) {
    const { status } = this.state;

    if (status === GAME_STATUS.READY) {
      this.setState({
        status: GAME_STATUS.RUNNING,
      }, () => {
        const result = this.fieldInst.step([x, y]);
        this.startTimer();
        // 更新雷区情况
        this.setState({
          field: this.fieldInst.data,
        }, () => {
          if (!result) {
            this.setState({
              status: GAME_STATUS.OVER,
            });
          }
        });
      });
    }

    if (status === GAME_STATUS.RUNNING) {
      const result = this.fieldInst.step([x, y]);

      // 更新雷区情况
      this.setState({
        field: this.fieldInst.data,
      }, () => {
        if (!result) {
          this.setState({
            status: GAME_STATUS.OVER,
          });
        }
      });
    }
  }

  startTimer() {
    const { status, time } = this.state;

    if (status === GAME_STATUS.RUNNING) {
      setTimeout(() => {
        this.setState({
          time: time + 1,
        });
      }, 1000);
    }
  }

  renderOne(x, y, item) {
    const text = _.some([FLAG.E, FLAG.M], flag => flag === item) ? '' : item;
    return (
      <button
        key={`${x}-${y}`}
        onClick={() => this.onClick(x, y)}
      >{text}
      </button>);
  }

  renderField() {
    const { field } = this.state;
    return _.map(field, (col, x) => (
      <p key={x}>{_.map(col, (item, y) =>
        this.renderOne(x, y, item))}
      </p>));
  }


  render() {
    const { time, status, mode } = this.state;
    return (
      <div>
        <p>Game Mode: {mode}</p>
        {status === GAME_STATUS.OVER && (
          <div>
            <p>GAME OVER!</p>
            <button onClick={() => this.onReset()}>Reset</button>
          </div>
        )}
        <p>{time}</p>
        {
        this.renderField()}
      </div>);
  }
}

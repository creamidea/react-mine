import React, { Component } from 'react';
import _ from 'lodash';
import MineField from './mine-field';

export default class Mine extends Component {
  constructor() {
    super();
    const field = new MineField('easy');
    this.state = {
      field: field.data,
    };
    this.field = field;
  }

  onClick(x, y) {
    // 踩到 [x, y] 位置
    this.field.step([x, y]);

    // 更新雷区情况
    this.setState({
      field: this.field.data,
    });
  }

  renderOne(x, y, item) {
    return (<button key={`${x}-${y}`} onClick={() => this.onClick(x, y)}>{item}</button>);
  }

  render() {
    const { field } = this.state;
    return _.map(field, (col, x) => (<p key={x}>{ _.map(col, (item, y) => this.renderOne(x, y, item))}</p>));
  }
}

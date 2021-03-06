import _ from 'lodash';
import { FIELD_FLAG as FLAG } from './constant';


function bfs(field, position) {
  const direction = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const { data } = field;
  const queue = [];

  queue.push(position);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    const item = data[x][y];

    if (item.flag) {
      return false;
    } else if (item.value === FLAG.M) {
      data[x][y].value = FLAG.X;
      return true;
    }

    const mineNumber = direction.reduce((acc, d) => {
      const x1 = x + d[0];
      const y1 = y + d[1];
      return field.isInRange([x1, y1]) && data[x1][y1].value === FLAG.M ? acc + 1 : acc;
    }, 0);

    if (mineNumber === 0) {
      data[x][y].value = FLAG.B;
      _.each(direction, (d) => {
        const x1 = x + d[0];
        const y1 = y + d[1];
        if (field.isInRange([x1, y1]) && data[x1][y1].value === FLAG.E) {
          data[x1][y1].value = FLAG.B;
          queue.push([x1, y1]);
        }
      });
    } else {
      data[x][y].value = mineNumber;
    }
  }

  return false;
}

export default function policy(field, position) {
  return bfs(field, position);
}

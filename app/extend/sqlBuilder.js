'use strict';

const _ = require('lodash');

class sqlBuilder {

  joiner(join) {
    if (_.isString(join)) {
      return 'LEFT JOIN ' + join;
    }
    if (_.isArray(join)) {
      let str = '';
      for (const i in join) {
        const item = join[i];
        str += ' LEFT JOIN ' + item;
      }
      return str;
    }
    return '';
  }

  /**
   * 创件sql的where部分
   * @param {*} map map
   * @param {number} isOr 是否或
   */
  where(map, isOr = 0) {
    if (!map) {
      return ' (1=1) ';
    }
    if (_.isString(map)) {
      return '(' + map + ')';
    }
    let str = '';
    const ao = isOr ? ' OR ' : ' AND ';
    const mapIsArray = _.isArray(map);
    for (const key in map) {
      const item = map[key];
      const aoo = str ? ao : ' ';
      if (_.isString(item)) {
        if (mapIsArray) {
          str += aoo + ' ' + item;
        } else {
          str += aoo + key + ' = ' + item + "' ";
        }
      } else if (_.isNumber(item)) {
        if (mapIsArray) { continue; }
        str += aoo + key + ' = ' + item + ' ';
      } else if (_.isArray(item) && item.length > 0) {
        let field = key;
        let value = _.isString(item[1]) ? " '" + item[1] + "' " : (_.isNumber(item[1]) ? item[1] : false);
        let cpr = item[0];
        if (mapIsArray) {
          field = item[0];
          if (item.length === 3) {
            cpr = item[1];
            value = _.isString(item[2]) ? " '" + item[2] + "' " : (_.isNumber(item[2]) ? item[2] : false);
          } else if (item.length === 2) {
            cpr = ' = ';
          } else {
            str += aoo + ' ' + item[0];
            continue;
          }
        }
        if (value === false) {
          continue;
        }
        if (cpr.toLowerCase() === 'raw' && _.isString(item[2])) {
          str += aoo + field + item[2];
        } else if (cpr.toLowerCase() !== 'raw') {
          str += aoo + field + ' ' + cpr + ' ' + value;
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
    if (!str) {
      str = ' (1=1) ';
    } else {
      str = ' (' + str + ') ';
    }
    return str;
  }

}

module.exports = sqlBuilder;
